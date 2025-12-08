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

  // 1. Pobranie danych do edycji
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Security Check: Czy to autor?
        if (project.author_id !== user.id) {
          toast.error("You don't have permission to edit this project.");
          navigate('/my-projects');
          return;
        }

        // Mapowanie danych z bazy na format formularza
        setInitialData({
          title: project.title,
          type: project.type,
          description: project.description,
          skills: project.skills || [],
          teamSize: project.members_max,
          deadline: project.deadline === 'Flexible' ? '' : project.deadline
        });

      } catch (error) {
        console.error(error);
        toast.error("Error loading project data.");
        navigate('/my-projects');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProject();
  }, [user, id, navigate]);

  // 2. Obsługa zapisu (UPDATE)
  const handleUpdate = async (formData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          skills: formData.skills,
          members_max: formData.teamSize,
          deadline: formData.deadline || 'Flexible',
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Project updated successfully! 🚀');
      navigate('/my-projects');

    } catch (error) {
      console.error(error);
      toast.error('Failed to update project.');
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