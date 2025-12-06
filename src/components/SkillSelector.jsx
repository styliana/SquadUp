import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Sparkles } from 'lucide-react';

const SkillSelector = ({ selectedSkills, setSelectedSkills, showLabel = true }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]); // Nowy stan
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    // Pobieramy wszystkie skille + informację czy są popularne
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setAllSkills(data.map(item => item.name));
      // Filtrujemy te, które mają flagę is_popular
      setPopularSkills(data.filter(item => item.is_popular).map(item => item.name));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allSkills.filter(skill => 
        skill.toLowerCase().includes(query.toLowerCase()) && 
        !selectedSkills.includes(skill)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, allSkills, selectedSkills]);

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setQuery('');
    setSuggestions([]);
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="relative">
      {showLabel && (
        <label className="block text-sm font-medium text-white mb-2">
          Required Skills
        </label>
      )}

      {/* INPUT */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? "Loading..." : "Search skills..."}
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
        />
        
        {/* DROPDOWN WYNIKÓW */}
        {suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-surface border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {suggestions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SUGEROWANE (POPULARNE) - Tylko jeśli nie ma wybranych skilli (dla czystości) */}
      {selectedSkills.length === 0 && popularSkills.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-textMuted mb-2 flex items-center gap-1">
            <Sparkles size={12} className="text-primary" /> Popular:
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSkills.slice(0, 7).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-2 py-1 rounded bg-white/5 border border-white/5 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WYBRANE SKILLSY */}
      <div className="flex flex-wrap gap-2 mt-4">
        {selectedSkills.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in zoom-in duration-200">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;