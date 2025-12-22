import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useProjects = (user) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [userProfile, setUserProfile] = useState({ skills: [], preferred_categories: [] });

  const ITEMS_PER_PAGE = 6;

  const fetchProjects = useCallback(async (filters, isInitial = true) => {
    setLoading(true);
    try {
      const { page, searchTerm, selectedType, selectedSkills, showRecommended } = filters;
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // 1. POBIERANIE PROFILU UŻYTKOWNIKA (dla rekomendacji)
      if (user && isInitial) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, profile_skills(skills(name))')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          // Mapujemy skille z formatu relacyjnego na prostą tablicę
          const flatSkills = profile.profile_skills?.map(ps => ps.skills.name) || [];
          setUserProfile({ ...profile, skills: flatSkills });
        }
      }

      // 2. GŁÓWNE ZAPYTANIE O PROJEKTY (Z JOINEM SKILLI)
// Znajdź zapytanie w useProjects.js i zmień je na:
let query = supabase
  .from('projects')
  .select(`
    *,
    profiles (
      id,
      full_name,
      avatar_url,
      university
    ),
    project_skills (
      skills (
        id,
        name
      )
    )
  `)
  .order('created_at', { ascending: false });

      // Filtrowanie po typie/kategorii
      if (selectedType && selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      // Wyszukiwanie tekstowe
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Sortowanie i Paginacja
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

// Mapowanie wyników z formatu relacyjnego na płaską tablicę stringów 'skills'
const formattedData = data.map(project => ({
  ...project,
  skills: project.project_skills?.map(ps => ps.skills.name) || []
}));

// ZMIANA LOGIKI Z AND (every) NA OR (some)
let finalData = formattedData;
if (selectedSkills && selectedSkills.length > 0) {
  finalData = formattedData.filter(proj => 
    // .some sprawia, że wystarczy dopasowanie JEDNEJ z wybranych umiejętności
    selectedSkills.some(skill => proj.skills.includes(skill))
  );
}

      if (isInitial) {
        setProjects(finalData);
      } else {
        setProjects(prev => [...prev, ...finalData]);
      }

      setHasMore(count > to + 1);
    } catch (error) {
      console.error('Error in useProjects:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { projects, loading, hasMore, fetchProjects, userProfile };
};