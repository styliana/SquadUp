import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
// IMPORT HOOKA
import useThrowAsyncError from './useThrowAsyncError';

const PAGE_SIZE = 6;

export const useProjects = (user) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // INICJALIZACJA
  const throwAsyncError = useThrowAsyncError();
  
  const [userProfile, setUserProfile] = useState({
    skills: [],
    preferred_categories: []
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('skills, preferred_categories')
            .eq('id', user.id)
            .single();
          
          if (error) throw error; // To nie jest krytyczne dla listy projektów, ale warto logować
          
          if (data) {
            setUserProfile({
              skills: data.skills || [],
              preferred_categories: data.preferred_categories || []
            });
          }
        } catch (err) {
          console.error("Error fetching user preferences:", err);
          // Nie rzucamy tutaj throwAsyncError, bo aplikacja może działać bez preferencji
        }
      };
      fetchProfile();
    }
  }, [user]);

  const fetchProjects = useCallback(async ({ page, searchTerm, selectedType, selectedSkills, showRecommended }, isReset = false) => {
    try {
      setLoading(true);
      if (isReset) toast.dismiss();

      let query;

      if (searchTerm) {
        query = supabase
          .rpc('search_projects', { keyword: searchTerm })
          .select('*, profiles:author_id(full_name, avatar_url, university)');
      } else {
        query = supabase
          .from('projects')
          .select('*, profiles:author_id(full_name, avatar_url, university)', { count: 'exact' });
      }

      query = query.eq('status', 'open');

      if (selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      if (selectedSkills.length > 0) {
        query = query.contains('skills', selectedSkills);
      }

      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (!searchTerm) {
         query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;

      let processedData = (data || []).filter(p => p.members_current < p.members_max);

      const hasPreferences = userProfile.skills.length > 0 || userProfile.preferred_categories.length > 0;

      if (showRecommended && hasPreferences) {
        processedData = processedData.map(p => {
          let score = 0;
          const skillMatches = p.skills?.filter(s => userProfile.skills.includes(s)).length || 0;
          score += skillMatches; 
          if (userProfile.preferred_categories.includes(p.type)) score += 2;
          
          return { ...p, matchScore: score };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
      }

      if (isReset) {
        setProjects(processedData);
      } else {
        setProjects(prev => [...prev, ...processedData]);
      }

      setHasMore(data.length >= PAGE_SIZE);

    } catch (error) {
      console.error('Critical Project Fetch Error:', error);
      
      // Ignorujemy błędy abortowania (anulowania fetch)
      if (error.name === 'AbortError') return;

      // KRYTYCZNY BŁĄD -> ERROR BOUNDARY
      throwAsyncError(error);
      
    } finally {
      setLoading(false);
    }
  }, [userProfile]); // throwAsyncError jest stabilne

  return {
    projects,
    loading,
    hasMore,
    fetchProjects,
    userProfile
  };
};