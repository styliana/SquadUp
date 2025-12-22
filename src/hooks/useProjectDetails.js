import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useProjectDetails = (id) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
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
                name
              )
            ),
            applications (
              id,
              status,
              profiles (
                id,
                full_name,
                avatar_url
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Mapowanie relacyjnych skilli na płaską tablicę nazw dla komponentu
        const formattedProject = {
          ...data,
          skills: data.project_skills?.map(ps => ps.skills.name) || []
        };

        setProject(formattedProject);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  return { project, loading };
};