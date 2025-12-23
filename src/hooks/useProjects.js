import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { sortProjectsByRelevance } from '../utils/recommendationAlgo';

export const useProjects = (user) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [userProfile, setUserProfile] = useState({});

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
          const formattedSkills = data.profile_skills
            ?.map(ps => ps.skills?.name)
            .filter(name => typeof name === 'string') 
            || [];
          
          setUserProfile({
            ...data,
            skills: formattedSkills 
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    fetchProfile();
  }, [user]);

  const fetchProjects = useCallback(async (filters, isReset) => {
    const { page = 0, searchTerm = '', selectedType = 'All', selectedSkills = [], showRecommended = false } = filters;
    const PAGE_SIZE = 6;

    try {
      setLoading(true);

      const isRecommendationMode = showRecommended && (userProfile?.preferred_categories?.length > 0 || userProfile?.skills?.length > 0);

      // ZMIANA: Dodajemy pobieranie tabeli applications (tylko status), aby policzyć realną liczbę członków
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles:author_id ( full_name, avatar_url, email ),
          categories!inner ( id, name ),
          project_skills (
            skills ( id, name )
          ),
          applications ( status )
        `, { count: 'exact' })
        .eq('status_id', 1);

      if (!isRecommendationMode) {
        query = query.order('created_at', { ascending: false });
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);
      } else {
        query = query.order('created_at', { ascending: false }).limit(100);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      if (selectedType && selectedType !== 'All') {
        query = query.eq('categories.name', selectedType);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Transformacja danych
      let formattedData = data.map(p => ({
        ...p,
        type: p.categories?.name || 'Unknown', 
        skills: p.project_skills
            ?.map(ps => ps.skills?.name)
            .filter(name => typeof name === 'string') 
            || [],
        // ZMIANA: Nadpisujemy members_current
        members_current: 1 + (p.applications?.filter(a => a.status === 'accepted').length || 0)
      }));

      formattedData = formattedData.filter(p => p.members_current < p.members_max);

      if (selectedSkills.length > 0) {
        const requiredSkills = selectedSkills.map(s => s.name?.toLowerCase()).filter(Boolean); 
        formattedData = formattedData.filter(p => 
          p.skills.some(skillName => requiredSkills.includes(skillName.toLowerCase()))
        );
      }

      if (isRecommendationMode) {
        formattedData = sortProjectsByRelevance(formattedData, userProfile);
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        const paginatedSlice = formattedData.slice(from, to);
        setHasMore(to < formattedData.length);
        formattedData = paginatedSlice;
      } else {
        if (count !== null) {
           const to = (page * PAGE_SIZE) + PAGE_SIZE - 1;
           setHasMore(to < count - 1);
        } else {
           setHasMore(data.length === PAGE_SIZE);
        }
      }

      setProjects(prev => {
        if (isReset) return formattedData; 
        
        const existingIds = new Set(prev.map(p => p.id));
        const newUnique = formattedData.filter(p => !existingIds.has(p.id));
        return [...prev, ...newUnique];
      });

    } catch (err) {
      console.error("Fetch projects error:", err);
      toast.error("Could not load projects");
    } finally {
      setLoading(false);
    }
  }, [userProfile]); 

  return { projects, loading, hasMore, fetchProjects, userProfile };
};