import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Potrzebujemy danych autora
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Hackathon',
    description: '',
    skills: [],
    skillInput: '',
    teamSize: 4,
    deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = ['Hackathon', 'Competition', 'Portfolio', 'Startup'];
  const popularSkills = ['React', 'Python', 'Figma', 'Node.js', 'TypeScript'];

  const handleAddSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill], skillInput: '' });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Musisz być zalogowany!");
      return;
    }
    
    setIsSubmitting(true);

    // Wysyłamy dane do Supabase
    const { error } = await supabase
      .from('projects')
      .insert([
        {
          title: formData.title,
          type: formData.type,
          description: formData.description,
          skills: formData.skills,
          members_max: formData.teamSize,
          members_current: 1, // Zawsze zaczynamy od autora
          deadline: formData.deadline || 'Flexible',
          author: user.email.split('@')[0], // Uproszczenie: Bierzemy część maila jako nick
          role: 'Leader' // Domyślna rola
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert('Błąd podczas dodawania projektu.');
    } else {
      alert('Projekt dodany pomyślnie! 🎉');
      navigate('/projects');
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
              {projectTypes.map(type => (
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
              ))}
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

        <div className="pt-6 border-t border-white/5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Required Skills</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                className="flex-grow bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                placeholder="Type a skill..."
                value={formData.skillInput}
                onChange={e => setFormData({...formData, skillInput: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(formData.skillInput))}
              />
              <button 
                type="button"
                onClick={() => handleAddSkill(formData.skillInput)}
                className="bg-white/5 border border-white/10 text-white px-4 rounded-xl hover:bg-white/10"
              >
                <Plus size={24} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {popularSkills.map(skill => (
                <button 
                  key={skill} 
                  type="button" 
                  onClick={() => handleAddSkill(skill)}
                  className="text-xs text-textMuted hover:text-primary transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)}>
                    <X size={14} className="hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          </div>
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
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-primary/25 disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateProject;