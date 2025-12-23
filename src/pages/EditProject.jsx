import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import ProjectForm from '../components/ProjectForm';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // 1. Pobranie danych do edycji (Z relacją skilli)
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data: project, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_skills (
              skills ( id, name ) 
            )
          `) // ZMIANA: Pobieramy id ORAZ name
          .eq('id', id)
          .single();

        if (error) throw error;

        // Security Check: Czy to autor?
        if (project.author_id !== user.id) {
          toast.error("You don't have permission to edit this project.");
          navigate('/my-projects');
          return;
        }

        // ZMIANA: Mapowanie na obiekty {id, name}, a nie same stringi
        // SkillSelector wymaga obiektów, aby móc je poprawnie usuwać po ID
        const mappedSkills = project.project_skills?.map(ps => ({
          id: ps.skills.id,
          name: ps.skills.name
        })) || [];

        // Mapowanie danych z bazy na format formularza
        setInitialData({
          title: project.title,
          type: project.type,
          description: project.description,
          skills: mappedSkills, // Teraz przekazujemy poprawne obiekty
          members_max: project.members_max,
          deadline: project.deadline
        });

      } catch (error) {
        console.error(error);
        toast.error("Error loading project data.");
        navigate('/my-projects');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) fetchProject();
  }, [user, id, navigate]);

  // 2. Obsługa zapisu (UPDATE)
  const handleUpdate = async (formData) => {
    setIsSubmitting(true);

    try {
      // KROK A: Aktualizacja danych podstawowych w tabeli 'projects'
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          members_max: formData.members_max,
          // NAPRAWA: Wyślij NULL zamiast 'Flexible'
          deadline: formData.deadline || null,
        })
        .eq('id', id);

      if (projectError) throw projectError;

      // KROK B: Synchronizacja skilli (Relacyjnie)
      
      // 1. Usuwamy stare powiązania
      const { error: deleteError } = await supabase
        .from('project_skills')
        .delete()
        .eq('project_id', id);
      
      if (deleteError) throw deleteError;

      // 2. Wstawiamy nowe powiązania
      // ZMIANA: Używamy bezpośrednio ID z obiektów w formData.skills
      // Nie musimy już szukać ID po nazwie, bo mamy je w obiekcie
      if (formData.skills && formData.skills.length > 0) {
        
        const skillMappings = formData.skills.map(s => ({
          project_id: id,
          skill_id: s.id
        }));

        const { error: insertError } = await supabase
          .from('project_skills')
          .insert(skillMappings);
        
        if (insertError) throw insertError;
      }

      toast.success('Project updated successfully! 🚀');
      navigate('/my-projects');

    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update project: ' + error.message);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <ProjectForm 
      initialData={initialData}
      onSubmit={handleUpdate}
      isSubmitting={isSubmitting}
      pageTitle="Edit Project"
      pageDescription="Update your listing details."
    />
  );
};

export default EditProject;