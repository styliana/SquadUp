import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

export const useProjects = (user) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [userProfile, setUserProfile] = useState({});

  // 1. Pobieranie profilu użytkownika (wraz ze skillami!)
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            profile_skills (
              skills ( id, name )
            )
          `)
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          // NAPRAWA: Wyciągamy samą nazwę (.name), aby ProjectCard dostał tablicę stringów
          // ps.skills to obiekt {id, name}, więc bierzemy ps.skills.name
          const formattedSkills = data.profile_skills
            ?.map(ps => ps.skills?.name) // <-- Tutaj była zmiana
            .filter(name => typeof name === 'string') // Upewniamy się, że to tekst
            || [];
          
          setUserProfile({
            ...data,
            skills: formattedSkills 
          });
        }
      } catch (err) {
        console.error("Error loading profile for recommendations:", err);
      }
    };

    fetchProfile();
  }, [user]);

  // 2. Główna funkcja pobierająca projekty
  const fetchProjects = useCallback(async (filters, isReset) => {
    const { page = 0, searchTerm = '', selectedType = 'All', selectedSkills = [], showRecommended = false } = filters;
    const PAGE_SIZE = 6;

    try {
      setLoading(true);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles:author_id ( full_name, avatar_url, email ),
          project_skills!inner (
            skills ( id, name )
          )
        `, { count: 'exact' })
        .eq('status_id', 1) // Tylko otwarte
        .order('created_at', { ascending: false })
        .range(from, to);

      // --- FILTROWANIE ---
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (selectedType && selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      if (showRecommended && userProfile?.preferred_categories?.length > 0) {
         query = query.in('type', userProfile.preferred_categories);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Transformacja danych
      const formattedData = data.map(p => ({
        ...p,
        skills: p.project_skills
            ?.map(ps => ps.skills?.name)
            .filter(name => typeof name === 'string') 
            || []
      }));

      // Filtrowanie po wybranych skillach (Client-side)
      let finalData = formattedData;
      if (selectedSkills.length > 0) {
        // selectedSkills w Projects.jsx to obiekty {id, name}, więc mapujemy na name
        const requiredSkills = selectedSkills
            .map(s => s.name?.toLowerCase())
            .filter(Boolean); 
        
        finalData = finalData.filter(p => 
          p.skills.some(skillName => requiredSkills.includes(skillName.toLowerCase()))
        );
      }

      // --- AKTUALIZACJA STANU ---
      setProjects(prev => {
        if (isReset) return finalData; 
        
        const existingIds = new Set(prev.map(p => p.id));
        const newUnique = finalData.filter(p => !existingIds.has(p.id));
        return [...prev, ...newUnique];
      });

      if (count !== null) {
        setHasMore(to < count - 1);
      } else {
        setHasMore(data.length === PAGE_SIZE);
      }

    } catch (err) {
      console.error("Fetch projects error:", err);
      toast.error("Could not load projects");
    } finally {
      setLoading(false);
    }
  }, [userProfile]); 

  return { projects, loading, hasMore, fetchProjects, userProfile };
};