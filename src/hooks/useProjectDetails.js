import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

export const useProjectDetails = (id) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Pobieramy projekt wraz z relacjami: autor, kategoria, skille
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            profiles:author_id (*),
            categories ( name ),
            project_skills (
              skills ( name )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Formatowanie danych pod widok (Frontend oczekuje pola 'type' i tablicy 'skills')
        const formattedProject = {
            ...data,
            // ZMIANA: Mapujemy obiekt kategorii na string (nazwę)
            type: data.categories?.name || 'Project', 
            // ZMIANA: Spłaszczamy strukturę skilli do prostej tablicy nazw
            skills: data.project_skills?.map(ps => ps.skills?.name) || []
        };
        
        setProject(formattedProject);

      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Project not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading };
};