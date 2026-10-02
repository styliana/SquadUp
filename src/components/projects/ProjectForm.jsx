import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import SkillSelector from '../common/SkillSelector';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { categoryService } from '../../services/categoryService';

export const projectSchema = z.object({
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

const defaultFormValues = {
  title: '',
  type: '',
  description: '',
  skills: [],
  teamSize: 4,
  deadline: '',
};

const ProjectForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  submitIcon = null,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultFormValues,
    values: initialData ? { ...defaultFormValues, ...initialData } : undefined,
  });

  const selectedType = watch('type');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getAll();
        if (data) {
          setCategories(data);
          if (data.length > 0 && !selectedType) {
            setValue('type', data[0].name);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [setValue, selectedType]);

  const handleFormSubmit = (data) => {
    const selectedCategory = categories.find(c => c.name === data.type);
    onSubmit(data, selectedCategory);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Project Title *</label>
            <input
              {...register("title")}
              className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none transition-colors ${
                errors.title ? 'border-red-500' : 'border-border focus:border-primary'
              }`}
              placeholder="e.g. AI Study Assistant"
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-3">Project Type *</label>
            <div className="flex flex-wrap gap-3">
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-textMuted text-sm">
                  <Loader2 className="animate-spin" size={16} /> Loading categories...
                </div>
              ) : (
                categories.map(cat => (
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
                ))
              )}
            </div>
            {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type.message}</p>}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Description *</label>
            <textarea
              {...register("description")}
              rows={5}
              className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none resize-none transition-colors ${
                errors.description ? 'border-red-500' : 'border-border focus:border-primary'
              }`}
              placeholder="Describe your project idea..."
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
                selectedSkills={value || []}
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
              className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain focus:outline-none transition-colors ${
                errors.teamSize ? 'border-red-500' : 'border-border focus:border-primary'
              }`}
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
          <Button variant="ghost" onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {submitIcon && <span className="mr-1.5 flex items-center">{submitIcon}</span>}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProjectForm;
