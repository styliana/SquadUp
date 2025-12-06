import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Check } from 'lucide-react';

const SkillSelector = ({ selectedSkills, setSelectedSkills }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Pobierz listę wszystkich technologii z bazy przy starcie
  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('name')
        .order('name');
      
      if (!error && data) {
        setAllSkills(data.map(item => item.name));
      }
      setLoading(false);
    };
    fetchSkills();
  }, []);

  // 2. Filtruj listę na podstawie tego, co wpisuje user
  useEffect(() => {
    if (query.length > 0) {
      const filtered = allSkills.filter(skill => 
        skill.toLowerCase().includes(query.toLowerCase()) && 
        !selectedSkills.includes(skill) // Nie pokazuj już wybranych
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, allSkills, selectedSkills]);

  const addSkill = (skill) => {
    setSelectedSkills([...selectedSkills, skill]);
    setQuery(''); // Czyść input
    setSuggestions([]); // Ukryj listę
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white mb-2">
        Required Skills (Choose from list)
      </label>

      {/* INPUT DO WYSZUKIWANIA */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? "Loading skills..." : "Type to search (e.g. React)..."}
          disabled={loading}
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
        />
        
        {/* LISTA PODPOWIEDZI (DROPDOWN) */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-surface border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {suggestions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between"
              >
                {skill}
                <PlusIcon />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* WYBRANE SKILLSY (CHIPSY) */}
      <div className="flex flex-wrap gap-2 mt-4">
        {selectedSkills.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in zoom-in duration-200">
            {skill}
            <button 
              type="button" 
              onClick={() => removeSkill(skill)}
              className="hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        {selectedSkills.length === 0 && (
          <span className="text-sm text-textMuted italic">No skills selected yet.</span>
        )}
      </div>
    </div>
  );
};

// Mała ikonka Plusa dla ozdoby
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default SkillSelector;