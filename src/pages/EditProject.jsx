import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import ProjectForm from '../components/projects/ProjectForm';
import { projectService } from '../services/projectService';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const project = await projectService.getById(id);

        if (user && project.author_id !== user.id) {
          toast.error('You are not the owner of this project.');
          navigate('/projects');
          return;
        }

        setInitialData({
          title: project.title,
          type: project.type,
          description: project.description,
          teamSize: project.members_max,
          deadline: project.deadline || '',
          skills: project.skills || project.project_skills?.map(ps => ps.skills) || [],
        });
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Failed to load project details.');
        navigate('/my-projects');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) fetchProject();
  }, [id, user, navigate]);

  const handleSubmit = async (data, category) => {
    if (!category) return toast.error('Invalid category selected');

    setIsSubmitting(true);
    try {
      const updates = {
        title: data.title,
        category_id: category.id,
        description: data.description,
        members_max: data.teamSize,
        deadline: data.deadline || null,
      };

      const { error: projectError } = await projectService.update(id, updates);
      if (projectError) throw projectError;

      if (data.skills && data.skills.length > 0) {
        const skillsToInsert = data.skills.map(skillObj => ({
          project_id: id,
          skill_id: skillObj.id,
        }));
        await projectService.updateSkills(id, skillsToInsert);
      }

      toast.success('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-textMuted hover:text-textMain hover:bg-surface border border-transparent hover:border-border rounded-xl transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-textMain">Edit Project</h1>
          <p className="text-textMuted">Make changes to your listing.</p>
        </div>
      </div>

      <ProjectForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
        submitIcon={<Save size={20} />}
      />
    </div>
  );
};

export default EditProject;