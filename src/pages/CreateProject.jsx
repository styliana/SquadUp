import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import SkillSelector from '../components/SkillSelector';
import { toast } from 'sonner';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Hackathon',
    description: '',
    skills: [],
    teamSize: 4,
    deadline: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data) {
        setCategories(data.map(c => c.name));
        if (data.length > 0 && !formData.type) {
          setFormData(prev => ({ ...prev, type: data[0].name }));
        }
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning('You must be logged in to create a project.');
      return;
    }
    
    if (formData.skills.length === 0) {
      toast.warning("Please select at least one skill!");
      return;
    }

    // 1. Blokujemy przycisk
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
            author: user.email.split('@')[0], 
            role: 'Leader',
            author_id: user.id
          }
        ]);

      if (error) throw error;

      // 2. SUKCES: Nie odblokowujemy przycisku (zostaje disabled),
      // wyświetlamy komunikat i przekierowujemy
      toast.success('Project created successfully! 🎉');
      navigate('/my-projects'); // ZMIANA: Przekierowanie do My Projects

    } catch (error) {
      // 3. BŁĄD: Tutaj odblokowujemy przycisk, żeby user mógł spróbować ponownie
      console.error(error);
      toast.error('Failed to create project. Please try again.');
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Listing</h1>
        <p className="text-textMuted">Describe your project and find the perfect team members.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-white/5 rounded-2xl p-8 space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Project Title *</label>
            <input 
              type="text" 
              required
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">Project Type *</label>
            <div className="flex flex-wrap gap-3">
              {categories.length > 0 ? categories.map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFormData({...formData, type})}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    formData.type === type 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-background border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {type}
                </button>
              )) : (
                <p className="text-sm text-textMuted">Loading categories...</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description *</label>
            <textarea 
              required
              rows={5}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <SkillSelector 
            selectedSkills={formData.skills} 
            setSelectedSkills={(newSkills) => setFormData({...formData, skills: newSkills})} 
          />
        </div>

        <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Team Size</label>
            <input 
              type="number" 
              min="2"
              max="10"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              value={formData.teamSize}
              onChange={e => setFormData({...formData, teamSize: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Deadline</label>
            <input 
              type="date" 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary [color-scheme:dark]"
              value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/projects')}
            className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting} // To teraz działa poprawnie do momentu przekierowania
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;