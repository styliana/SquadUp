import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ProjectForm from '../components/projects/ProjectForm';
import { projectService } from '../services/projectService';
import { PROJECT_STATUS } from '../utils/constants';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data, category) => {
    if (!user) return toast.error('Login required');
    if (!category) return toast.error('Invalid category selected');

    setIsSubmitting(true);
    try {
      const projectData = {
        title: data.title,
        category_id: category.id,
        description: data.description,
        members_max: data.teamSize,
        members_current: 1,
        deadline: data.deadline || null,
        author_id: user.id,
        status_id: PROJECT_STATUS.OPEN,
      };

      const { data: newProject, error: projectError } = await projectService.create(projectData);
      if (projectError) throw projectError;

      if (data.skills && data.skills.length > 0) {
        const skillsToInsert = data.skills.map(skillObj => ({
          project_id: newProject.id,
          skill_id: skillObj.id,
        }));
        await projectService.addSkills(skillsToInsert);
      }

      toast.success('Project created successfully! 🎉');
      navigate('/my-projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(`Failed to create project: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Create Listing</h1>
        <p className="text-textMuted">Describe your project and find the perfect team members.</p>
      </div>

      <ProjectForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Project"
      />
    </div>
  );
};

export default CreateProject;