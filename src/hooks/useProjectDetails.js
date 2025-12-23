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
        // ZMIANA: Dodajemy pobieranie tabeli applications wraz z profilami kandydatów
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            profiles:author_id (*),
            categories ( name ),
            project_skills (
              skills ( name )
            ),
            applications (
              id,
              status,
              profiles:applicant_id (*)
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Obliczamy aktualną liczbę członków: 1 (Lider) + liczba zaakceptowanych aplikacji
        const acceptedCount = data.applications?.filter(app => app.status === 'accepted').length || 0;
        const realMembersCurrent = 1 + acceptedCount;

        // Formatowanie danych pod widok
        const formattedProject = {
            ...data,
            type: data.categories?.name || 'Project', 
            skills: data.project_skills?.map(ps => ps.skills?.name) || [],
            // ZMIANA: Przekazujemy pobrane aplikacje do widoku
            applications: data.applications || [],
            // ZMIANA: Nadpisujemy members_current wyliczoną wartością, aby licznik był zawsze zgodny z liczbą awatarów
            members_current: realMembersCurrent
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