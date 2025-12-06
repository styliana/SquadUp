import { useEffect, useState } from 'react';
import { Search, Filter, Loader2, X, Sparkles } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext'; // Potrzebujemy Usera
import ProjectCard from '../components/ProjectCard';
import SkillSelector from '../components/SkillSelector';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STANY FILTRÓW
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState(['All']);
  
  // NOWE: Stan rekomendacji
  const [showRecommended, setShowRecommended] = useState(false);
  const [userSkills, setUserSkills] = useState([]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProjects(), fetchUserSkills()]);
      setLoading(false);
    };
    initData();
  }, [user]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data) setCategories(['All', ...data.map(c => c.name)]);
  };

  const fetchProjects = async () => {
    let { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Błąd:', error);
    else setProjects(data || []);
  };

  // Pobierz skille zalogowanego usera
  const fetchUserSkills = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('skills')
      .eq('id', user.id)
      .single();
    
    if (data?.skills) {
      setUserSkills(data.skills);
    }
  };

  // --- LOGIKA FILTROWANIA I SORTOWANIA ---
  const getProcessedProjects = () => {
    // 1. Najpierw filtrujemy
    let filtered = projects.filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || project.type === selectedType;
      const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.every(skill => project.skills?.includes(skill));

      return matchesSearch && matchesType && matchesSkills;
    });

    // 2. Jeśli włączone rekomendacje -> Sortuj po dopasowaniu
    if (showRecommended && userSkills.length > 0) {
      filtered = filtered.map(p => {
        // Policz punkty: +1 za każdy wspólny skill
        const matchCount = p.skills?.filter(s => userSkills.includes(s)).length || 0;
        return { ...p, matchScore: matchCount };
      })
      // Sortuj: najpierw te z największą liczbą punktów, potem najnowsze
      .sort((a, b) => b.matchScore - a.matchScore || new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  };

  const finalProjects = getProcessedProjects();

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

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Lewa strona: Filtr Skilli */}
            <div>
              <div 
                className="flex items-center gap-2 cursor-pointer w-fit" 
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

              {(showFilters || selectedSkills.length > 0) && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[300px]">
                  <SkillSelector 
                    selectedSkills={selectedSkills} 
                    setSelectedSkills={setSelectedSkills} 
                    showLabel={false} 
                  />
                </div>
              )}
            </div>

            {/* Prawa strona: Przełącznik AI / Rekomendacji */}
            {user && userSkills.length > 0 && (
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  showRecommended 
                    ? 'bg-gradient-to-r from-purple-500/20 to-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : 'bg-background border-white/10 text-textMuted hover:border-white/30'
                }`}
              >
                <Sparkles size={16} className={showRecommended ? 'text-yellow-300' : ''} />
                <span className="text-sm font-medium">For You</span>
              </button>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-textMuted border-t border-white/5 pt-4">
            <span>
              Showing {finalProjects.length} projects
              {showRecommended && <span className="text-primary ml-1">(Sorted by best match)</span>}
            </span>
            {(searchTerm || selectedType !== 'All' || selectedSkills.length > 0 || showRecommended) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setSelectedSkills([]);
                  setShowRecommended(false);
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
      ) : finalProjects.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-white/5">
          <p className="text-xl text-white mb-2">No projects found 🧐</p>
          <p className="text-textMuted">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {finalProjects.map((project) => (
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