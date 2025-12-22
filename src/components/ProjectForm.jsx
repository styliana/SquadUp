import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SkillSelector from './SkillSelector';
import { Loader2 } from 'lucide-react';

const ProjectForm = ({ initialData, onSubmit, isSubmitting, pageTitle, pageDescription }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  // Dopasowanie nazw pól do nazw kolumn w bazie danych
  const defaultData = {
    title: '',
    type: '',
    description: '',
    skills: [], // Tutaj przechowujemy tablicę nazw skilli
    members_max: 4, // Zmiana z teamSize na members_max (zgodnie z Twoją bazą)
    deadline: ''
  };

  const [formData, setFormData] = useState({ ...defaultData, ...initialData });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data) {
        setCategories(data.map(c => c.name));
        // Jeśli tworzymy nowy projekt i nie ma typu, ustaw pierwszy domyślny
        if (!formData.type && data.length > 0 && !initialData) {
          setFormData(prev => ({ ...prev, type: data[0].name }));
        }
      }
    };
    fetchCategories();
  }, [initialData]);

  // Synchronizacja z initialData (ważne przy edycji)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ 
        ...prev, 
        ...initialData,
        // Upewniamy się, że teamSize mapuje się na members_max jeśli przychodzi ze starego kodu
        members_max: initialData.members_max || initialData.teamSize || 4
      }));
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Przekazujemy czyste dane do komponentu nadrzędnego
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">{pageTitle}</h1>
        <p className="text-textMuted">{pageDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-8 space-y-8 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Project Title *</label>
            <input 
              type="text" 
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Eco-friendly Mobile App"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-3">Project Type *</label>
            <div className="flex flex-wrap gap-3">
              {categories.length > 0 ? categories.map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFormData({...formData, type})}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    formData.type === type 
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'bg-background border-border text-textMuted hover:border-primary/50'
                  }`}
                >
                  {type}
                </button>
              )) : (
                <div className="flex items-center gap-2 text-textMuted text-sm italic">
                  <Loader2 className="animate-spin" size={14} /> Loading categories...
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Description *</label>
            <textarea 
              required
              rows={5}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the goals, technology stack and who are you looking for..."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <SkillSelector 
            selectedSkills={formData.skills || []} 
            setSelectedSkills={(newSkills) => setFormData({...formData, skills: newSkills})} 
          />
        </div>

        <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Team Size (Max Members)</label>
            <input 
              type="number" 
              min="2" 
              max="15"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary"
              value={formData.members_max}
              onChange={e => setFormData({...formData, members_max: parseInt(e.target.value) || 2})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Deadline</label>
            <input 
              type="date" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary"
              value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-6 py-3 rounded-xl border border-border text-textMain font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;