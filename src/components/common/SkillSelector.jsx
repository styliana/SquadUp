import { useState, useEffect, useRef } from 'react';
import { Check, X, Search, Flame } from 'lucide-react';
import { useSkills } from '../../hooks/useSkills';

const SkillSelector = ({ selectedSkills, setSelectedSkills, showLabel = true }) => {
  const { allSkills, popularSkills, loading } = useSkills(); 
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Filtrowanie listy po wpisaniu tekstu
  const filteredSkills = search 
    ? allSkills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : allSkills;

  // Zamykanie dropdowna po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSkill = (skill) => {
    // Sprawdzamy czy skill już jest wybrany (porównujemy po ID)
    const exists = selectedSkills.some(s => s.id === skill.id);
    
    if (exists) {
      setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, { id: skill.id, name: skill.name }]);
    }
  };

  const isSelected = (skillId) => selectedSkills.some(s => s.id === skillId);

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {showLabel && <label className="block text-sm font-medium text-textMain mb-2">Technologies & Skills</label>}
      
      {/* INPUT SEARCH */}
      <div 
        className="flex flex-wrap items-center gap-2 p-3 bg-background border border-border rounded-xl focus-within:border-primary transition-colors min-h-[50px] cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Search size={16} className="text-textMuted ml-1" />
        
        {/* Renderowanie wybranych (jako tagi w inpucie) */}
        {selectedSkills.map(skill => (
          <span key={skill.id} className="bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
            {skill.name}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleSkill(skill); }}
              className="hover:text-red-400"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input 
          type="text" 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          className="bg-transparent outline-none flex-grow min-w-[120px] text-sm text-textMain placeholder:text-textMuted/50"
          placeholder={selectedSkills.length === 0 ? "Select skills (e.g. React, Python)..." : ""}
        />
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* SEKCJA POPULARNE (Tylko gdy nie szukamy) */}
          {!search && popularSkills.length > 0 && (
            <div className="p-2 border-b border-border bg-white/[0.02]">
              <div className="text-xs font-bold text-textMuted uppercase mb-2 px-2 flex items-center gap-1">
                <Flame size={12} className="text-orange-500" /> Popular
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {popularSkills.map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      isSelected(skill.id) 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-surface border-border text-textMuted hover:border-primary/50 hover:text-textMain'
                    }`}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LISTA WSZYSTKICH */}
          <div className="p-1">
            {loading ? (
              <div className="p-4 text-center text-textMuted text-xs">Loading skills...</div>
            ) : filteredSkills.length > 0 ? (
              filteredSkills.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between group transition-colors"
                >
                  <span className={`text-sm ${isSelected(skill.id) ? 'text-primary font-medium' : 'text-textMuted group-hover:text-textMain'}`}>
                    {skill.name}
                  </span>
                  {isSelected(skill.id) && <Check size={14} className="text-primary" />}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-textMuted text-xs">No skills found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSelector;