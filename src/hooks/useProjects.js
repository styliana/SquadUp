import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

const PAGE_SIZE = 6;

export const useProjects = (user) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Przechowujemy preferencje usera w hooku, bo są potrzebne do algorytmu rekomendacji
  const [userProfile, setUserProfile] = useState({
    skills: [],
    preferred_categories: []
  });

  // 1. Pobierz profil usera (do rekomendacji)
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('skills, preferred_categories')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserProfile({
            skills: data.skills || [],
            preferred_categories: data.preferred_categories || []
          });
        }
      };
      fetchProfile();
    }
  }, [user]);

  // 2. Główna funkcja pobierająca
  const fetchProjects = useCallback(async ({ page, searchTerm, selectedType, selectedSkills, showRecommended }, isReset = false) => {
    try {
      setLoading(true);
      if (isReset) toast.dismiss();

      let query;

      // A. Wybór źródła danych (RPC vs Tabela)
      if (searchTerm) {
        query = supabase.rpc('search_projects', { keyword: searchTerm });
      } else {
        query = supabase.from('projects').select('*', { count: 'exact' });
      }

      // B. Filtry bazodanowe
      query = query.eq('status', 'open');

      if (selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      if (selectedSkills.length > 0) {
        query = query.contains('skills', selectedSkills);
      }

      // C. Paginacja
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      // D. Sortowanie (jeśli nie szukamy - bo search_projects sortuje po trafności)
      if (!searchTerm) {
         query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // E. Filtrowanie i Logika Rekomendacji (Client-side logic)
      let processedData = (data || []).filter(p => p.members_current < p.members_max);

      const hasPreferences = userProfile.skills.length > 0 || userProfile.preferred_categories.length > 0;

      if (showRecommended && hasPreferences) {
        processedData = processedData.map(p => {
          let score = 0;
          // Algorytm punktacji
          const skillMatches = p.skills?.filter(s => userProfile.skills.includes(s)).length || 0;
          score += skillMatches; 
          if (userProfile.preferred_categories.includes(p.type)) score += 2;
          
          return { ...p, matchScore: score };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
      }

      // F. Aktualizacja stanu
      if (isReset) {
        setProjects(processedData);
      } else {
        setProjects(prev => [...prev, ...processedData]);
      }

      setHasMore(data.length >= PAGE_SIZE);

    } catch (error) {
      console.error('Błąd pobierania projektów:', error);
      // Ignorujemy błąd przerwania zapytania (częste przy szybkim pisaniu)
      if (error.code !== 'PX000' && error.name !== 'AbortError') {
         toast.error("Could not fetch projects");
      }
    } finally {
      setLoading(false);
    }
  }, [userProfile]); // Zależy od profilu, bo profil wpływa na sortowanie

  return {
    projects,
    loading,
    hasMore,
    fetchProjects,
    userProfile // Eksportujemy, żeby UI wiedział czy pokazać przycisk "For You"
  };
};