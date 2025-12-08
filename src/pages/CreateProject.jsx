import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ProjectForm from '../components/ProjectForm';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (formData) => {
    if (!user) {
      toast.warning('You must be logged in to create a project.');
      return;
    }
    
    if (formData.skills.length === 0) {
      toast.warning("Please select at least one skill!");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            title: formData.title,
            type: formData.type,
            description: formData.description,
            skills: formData.skills,
            members_max: formData.teamSize,
            members_current: 1,
            deadline: formData.deadline || 'Flexible',
            // Fallback dla starych pól (author), ale główną robotę robi teraz author_id
            author: user.email?.split('@')[0] || 'User', 
            role: 'Leader',
            author_id: user.id
          }
        ]);

      if (error) throw error;

      toast.success('Project created successfully! 🎉');
      navigate('/my-projects');

    } catch (error) {
      console.error(error);
      toast.error('Failed to create project. Please try again.');
      setIsSubmitting(false); 
    }
  };

  return (
    <ProjectForm 
      onSubmit={handleCreate}
      isSubmitting={isSubmitting}
      pageTitle="Create Listing"
      pageDescription="Describe your project and find the perfect team members."
    />
  );
};

export default CreateProject;