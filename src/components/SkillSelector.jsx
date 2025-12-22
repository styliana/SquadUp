import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Sparkles, Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const SkillSelector = ({ selectedSkills, setSelectedSkills, showLabel = true }) => {
  const [query, setQuery] = useState('');
  
  const debouncedQuery = useDebounce(query, 300);
  
  const [suggestions, setSuggestions] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. ZMIANA: Pobieranie TOP 10 najczęściej używanych skilli (usage_count)
  useEffect(() => {
    const fetchPopular = async () => {
      const { data } = await supabase
        .from('skills')
        .select('name')
        .order('usage_count', { ascending: false }) // Sortowanie malejące po liczniku użycia
        .limit(10);
      
      if (data) setPopularSkills(data.map(i => i.name));
    };
    fetchPopular();
  }, []);

  // 2. Wyszukiwanie (bez zmian)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('name')
        .ilike('name', `%${debouncedQuery}%`)
        .limit(5);

      if (!error && data) {
        setSuggestions(data.map(item => item.name).filter(s => !selectedSkills.includes(s)));
      }
      setLoading(false);
    };

    fetchSuggestions();
  }, [debouncedQuery, selectedSkills]);

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

  // ZMIANA: Filtrujemy listę popularnych, by ukryć te już wybrane
  // Dzięki temu lista nie znika całkowicie, ale "chudnie" w miarę wybierania
  const visiblePopularSkills = popularSkills.filter(skill => !selectedSkills.includes(skill));

  return (
    <div className="relative">
      {showLabel && (
        <label className="block text-sm font-medium text-textMain mb-2">
          Required Skills
        </label>
      )}

      {/* INPUT */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted">
            <Search size={16} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search skills (e.g. React)..."
          className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
        />
        
        {loading && (
             <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
        )}

        {suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {suggestions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full text-left px-4 py-2 text-textMuted hover:bg-primary/20 hover:text-textMain transition-colors block"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ZMIANA: Wyświetlamy popularne, dopóki użytkownik nie wpisze własnego zapytania */}
      {query.length === 0 && visiblePopularSkills.length > 0 && (
        <div className="mt-3 animate-in fade-in">
          <div className="text-xs text-textMuted mb-2 flex items-center gap-1">
            <Sparkles size={12} className="text-primary" /> Popular:
          </div>
          <div className="flex flex-wrap gap-2">
            {visiblePopularSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-400 hover:text-textMain hover:border-border hover:bg-white/10 transition-all"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {selectedSkills.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in zoom-in duration-200">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-textMain transition-colors">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;