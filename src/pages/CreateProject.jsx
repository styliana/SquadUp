import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import SkillSelector from '../components/SkillSelector';

// Definicja schematu walidacji Zod
const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.string().min(1, "Project type is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  // ZMIANA: Teraz oczekujemy tablicy obiektów {id, name} ze SkillSelector
  skills: z.array(z.object({
    id: z.number(),
    name: z.string()
  })).min(1, "Select at least one skill"),
  teamSize: z.coerce.number().min(2, "Team size must be at least 2").max(10, "Max 10 members"),
  deadline: z.string().optional(),
});

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      type: 'Hackathon',
      description: '',
      skills: [],
      teamSize: 4,
      deadline: ''
    }
  });

  const selectedType = watch('type');
  const categories = ['Hackathon', 'Portfolio', 'Startup', 'Research', 'Competition', 'Non-profit'];

  const onSubmit = async (data) => {
    if (!user) return toast.error('Login required');
    
    try {
      // KROK 1: Wstawienie projektu do tabeli 'projects'
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert([
            {
              title: data.title,
              type: data.type,
              description: data.description,
              members_max: data.teamSize,
              members_current: 1,
              // NAPRAWA: Jeśli brak daty, wyślij NULL, a nie tekst 'Flexible'
              deadline: data.deadline || null, 
              author_id: user.id,
              status_id: 1,
            }
          ])
        .select()
        .single();

      if (projectError) throw projectError;

      // KROK 2: Wstawienie powiązań do tabeli 'project_skills'
      if (data.skills && data.skills.length > 0) {
        const skillsToInsert = data.skills.map(skillObj => ({
          project_id: newProject.id,
          skill_id: skillObj.id // Używamy bigint ID z bazy
        }));

        const { error: skillsError } = await supabase
          .from('project_skills')
          .insert(skillsToInsert);

        if (skillsError) throw skillsError;
      }

      toast.success('Project created successfully! 🎉');
      navigate('/my-projects');
    } catch (error) {
      console.error("Błąd podczas tworzenia projektu:", error);
      toast.error(`Failed to create project: ${error.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Create Listing</h1>
        <p className="text-textMuted">Describe your project and find the perfect team members.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-2xl p-8 space-y-8 shadow-sm">
        <div className="space-y-6">
          
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Project Title *</label>
            <input 
              {...register("title")}
              className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none transition-colors ${errors.title ? 'border-red-500' : 'border-border focus:border-primary'}`}
              placeholder="e.g. AI Study Assistant"
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-3">Project Type *</label>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setValue("type", cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    selectedType === cat 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-background border-border text-textMuted hover:border-primary/50 hover:text-textMain'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type.message}</p>}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Description *</label>
            <textarea 
              {...register("description")}
              rows={5}
              className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none resize-none transition-colors ${errors.description ? 'border-red-500' : 'border-border focus:border-primary'}`}
              placeholder="Describe your project idea..."
            />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* SKILLS SELECTOR */}
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
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-border text-textMain font-medium hover:bg-textMain/5"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={20} />}
            {isSubmitting ? 'Saving...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;