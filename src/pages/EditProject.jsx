import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

// Komponenty i Serwisy
import SkillSelector from '../components/common/SkillSelector';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { projectService } from '../services/projectService';
import { supabase } from '../supabaseClient'; 

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.string().min(1, "Project type is required"), 
  description: z.string().min(20, "Description must be at least 20 characters"),
  skills: z.array(z.object({
    id: z.number(),
    name: z.string()
  })).min(1, "Select at least one skill"),
  teamSize: z.coerce.number().min(2, "Team size must be at least 2").max(10, "Max 10 members"),
  deadline: z.string().optional(),
});

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      type: '',
      description: '',
      skills: [],
      teamSize: 4,
      deadline: ''
    }
  });

  const selectedType = watch('type');

  // Pobieranie danych
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // A. Pobierz kategorie (można to wyciągnąć do hooka useCategories)
        const { data: cats } = await supabase.from('categories').select('id, name');
        if (cats) setDbCategories(cats);

        // B. Pobierz projekt przez Serwis
        const project = await projectService.getById(id);

        if (user && project.author_id !== user.id) {
          toast.error("You are not the owner of this project.");
          navigate('/projects');
          return;
        }

        // D. Wypełnij formularz
        reset({
          title: project.title,
          type: project.type, // projectService.getById już mapuje category_id na type
          description: project.description,
          teamSize: project.members_max,
          deadline: project.deadline || '',
          skills: project.project_skills?.map(ps => ps.skills) || []
        });

      } catch (error) {
        console.error("Error loading project:", error);
        toast.error("Failed to load project details.");
        navigate('/my-projects');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) fetchData();
  }, [id, user, navigate, reset]);


  const onSubmit = async (data) => {
    try {
      const selectedCategoryObj = dbCategories.find(c => c.name === data.type);
      if (!selectedCategoryObj) return toast.error("Invalid category selected");

      // 1. Aktualizacja projektu
      const updates = {
        title: data.title,
        category_id: selectedCategoryObj.id,
        description: data.description,
        members_max: data.teamSize,
        deadline: data.deadline || null,
      };

      const { error: projectError } = await projectService.update(id, updates);
      if (projectError) throw projectError;

      // 2. Aktualizacja skilli
      if (data.skills && data.skills.length > 0) {
        const skillsToInsert = data.skills.map(skillObj => ({
          project_id: id,
          skill_id: skillObj.id
        }));
        await projectService.updateSkills(id, skillsToInsert);
      }

      toast.success('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(`Update failed: ${error.message}`);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-textMuted hover:text-textMain hover:bg-surface border border-transparent hover:border-border rounded-xl transition-all">
           <ArrowLeft size={24} />
        </button>
        <div>
           <h1 className="text-3xl font-bold text-textMain">Edit Project</h1>
           <p className="text-textMuted">Make changes to your listing.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Project Title</label>
              <input 
                {...register("title")}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none transition-colors ${errors.title ? 'border-red-500' : 'border-border focus:border-primary'}`}
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
            </div>

            {/* TYPE */}
            <div>
              <label className="block text-sm font-medium text-textMain mb-3">Project Type</label>
              <div className="flex flex-wrap gap-3">
                {dbCategories.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setValue("type", cat.name)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                      selectedType === cat.name
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-background border-border text-textMuted hover:border-primary/50 hover:text-textMain'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type.message}</p>}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Description</label>
              <textarea 
                {...register("description")}
                rows={5}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none resize-none transition-colors ${errors.description ? 'border-red-500' : 'border-border focus:border-primary'}`}
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* SKILLS */}
          <div className="pt-6 border-t border-border">
            <Controller
              control={control}
              name="skills"
              render={({ field: { onChange, value } }) => (
                <SkillSelector 
                  selectedSkills={value} 
                  setSelectedSkills={onChange} 
                />
              )}
            />
            {errors.skills && <p className="text-xs text-red-400 mt-1">{errors.skills.message}</p>}
          </div>

          {/* TEAM SIZE & DEADLINE */}
          <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Team Size</label>
              <input 
                type="number"
                {...register("teamSize")}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none transition-colors ${errors.teamSize ? 'border-red-500' : 'border-border focus:border-primary'}`}
              />
              {errors.teamSize && <p className="text-xs text-red-400 mt-1">{errors.teamSize.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Deadline</label>
              <input 
                type="date" 
                {...register("deadline")}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary [color-scheme:dark]"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-6 flex justify-end gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Save size={20} /> Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProject;