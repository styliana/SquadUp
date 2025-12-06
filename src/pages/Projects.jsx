import { useEffect, useState } from 'react';
import { Search, Filter, Loader2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ProjectCard from '../components/ProjectCard';
import SkillSelector from '../components/SkillSelector'; // Twój nowy selektor

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STANY FILTRÓW
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Do chowania panelu skilli
  
  // NOWE: Dynamiczne kategorie z bazy
  const [categories, setCategories] = useState(['All']);

  // POBIERANIE DANYCH (Projekty + Kategorie)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Pobierz kategorie
      const { data: catsData } = await supabase
        .from('categories')
        .select('name')
        .order('name');
      
      if (catsData) {
        setCategories(['All', ...catsData.map(c => c.name)]);
      }

      // 2. Pobierz projekty
      const { data: projData, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Błąd:', error);
      else setProjects(projData || []);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  // --- LOGIKA FILTROWANIA ---
  const filteredProjects = projects.filter(project => {
    // 1. Filtr Tekstowy (Tytuł lub Opis)
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtr Typu (Kategorii)
    const matchesType = selectedType === 'All' || project.type === selectedType;

    // 3. Filtr Skilli (Projekt musi zawierać WSZYSTKIE wybrane skille)
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => project.skills?.includes(skill));

    return matchesSearch && matchesType && matchesSkills;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Find a <span className="text-primary">Project</span>
        </h1>
        <p className="text-textMuted mb-8">
          Find a project that matches your skills and interests.
        </p>

        {/* --- PASEK FILTRÓW --- */}
        <div className="flex flex-col gap-6 bg-surface border border-white/5 p-6 rounded-2xl shadow-xl">
          
          {/* GÓRA: Wyszukiwarka i Kategorie */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by keywords..." 
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Typy Projektów (Dynamiczne z bazy) */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setSelectedType(filter)}
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                    selectedType === filter
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-background border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* DÓŁ: Filtr po Skillach (Rozwijany) */}
          <div>
            <div 
              className="flex items-center gap-2 mb-3 cursor-pointer w-fit" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} className={showFilters ? 'text-primary' : 'text-textMuted'} />
              <span className={`text-sm font-medium transition-colors ${showFilters ? 'text-white' : 'text-textMuted'}`}>
                Filter by Skills
              </span>
              {selectedSkills.length > 0 && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {selectedSkills.length}
                </span>
              )}
            </div>

            {/* Panel Skilli - Używamy naszego komponentu */}
            {(showFilters || selectedSkills.length > 0) && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <SkillSelector 
                  selectedSkills={selectedSkills} 
                  setSelectedSkills={setSelectedSkills} 
                  showLabel={false} // Ukrywamy etykietę "Required Skills", bo tu nie pasuje
                />
              </div>
            )}
          </div>

          {/* Aktywne filtry (tylko info + czyszczenie) */}
          <div className="flex justify-between items-center text-xs text-textMuted border-t border-white/5 pt-4">
            <span>Showing {filteredProjects.length} projects</span>
            {(searchTerm || selectedType !== 'All' || selectedSkills.length > 0) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setSelectedSkills([]);
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>

        </div>
      </div>

      {/* WYNIKI */}
      {loading ? (
        <div className="flex justify-center py-20 text-primary">
          <Loader2 size={40} className="animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-white/5">
          <p className="text-xl text-white mb-2">No projects found 🧐</p>
          <p className="text-textMuted">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={{
                ...project,
                tags: project.skills || [],
                timePosted: new Date(project.created_at).toLocaleDateString(),
                membersCurrent: project.members_current,
                membersMax: project.members_max
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;