import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Loader2, X, Sparkles, ArrowDownCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import SkillSelector from '../components/SkillSelector';
import { toast } from 'sonner';

const PAGE_SIZE = 6;

const Projects = () => {
  const { user } = useAuth();
  
  // Dane
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [userSkills, setUserSkills] = useState([]);
  
  // Stany
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filtry
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);

  // 1. Inicjalizacja
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: catData } = await supabase.from('categories').select('name');
      if (catData) setCategories(['All', ...catData.map(c => c.name)]);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('skills')
          .eq('id', user.id)
          .single();
        if (profileData?.skills) setUserSkills(profileData.skills);
      }
    };
    fetchInitialData();
  }, [user]);

  // 2. Główna funkcja pobierająca (ZAJEBISTA WERSJA)
  const fetchProjects = useCallback(async (pageIndex, isReset = false) => {
    try {
      setLoading(true);
      if (isReset) toast.dismiss();

      let query;

      // --- LOGIKA WYSZUKIWANIA ---
      if (searchTerm) {
        // Używamy naszej nowej funkcji SQL (RPC)
        // Ona przeszukuje tytuł, opis I SKILLE (nawet fragmenty)
        query = supabase.rpc('search_projects', { keyword: searchTerm });
      } else {
        // Standardowe pobieranie
        query = supabase.from('projects').select('*', { count: 'exact' });
      }

      // --- FILTROWANIE (Łączymy RPC z resztą filtrów!) ---
      
      // Typ projektu
      if (selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      // Filtr Skilli (z Selectora)
      if (selectedSkills.length > 0) {
        query = query.contains('skills', selectedSkills);
      }

      // Sortowanie i Paginacja
      // Jeśli używamy RPC, sortowanie jest wewnątrz SQL, ale możemy nadpisać/doprecyzować tutaj
      query = query
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

      // Jeśli nie ma search term, dodajemy sortowanie (dla RPC jest już w SQL, ale to nie zaszkodzi)
      if (!searchTerm) {
         query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Logika rekomendacji (Client-side sort)
      let processedData = data || [];
      if (showRecommended && userSkills.length > 0) {
        processedData = processedData.map(p => {
          const matchCount = p.skills?.filter(s => userSkills.includes(s)).length || 0;
          return { ...p, matchScore: matchCount };
        }).sort((a, b) => b.matchScore - a.matchScore);
      }

      if (isReset) {
        setProjects(processedData);
      } else {
        setProjects(prev => [...prev, ...processedData]);
      }

      // Obsługa końca danych (dla RPC count może nie działać standardowo, więc sprawdzamy długość tablicy)
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (error) {
      console.error('Błąd:', error);
      if (error.code !== 'PX000' && error.name !== 'AbortError') {
         // Cichy błąd, nie spamujemy toasta przy szybkim pisaniu
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedSkills, showRecommended, userSkills]);

  // 3. Debounce i reszta efektów
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    const timeoutId = setTimeout(() => {
      fetchProjects(0, true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType, selectedSkills, showRecommended, fetchProjects]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects(nextPage, false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedSkills([]);
    setShowRecommended(false);
  };

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

        {/* --- KONSOLA STEROWANIA --- */}
        <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
          
          {/* SEARCH BAR & TYPE FILTER */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow group">
              <div className={`absolute inset-0 bg-primary/20 rounded-xl blur-md transition-opacity ${searchTerm ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="relative bg-background rounded-xl border border-white/10 flex items-center overflow-hidden focus-within:border-primary transition-colors">
                <Search className="ml-4 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search projects (e.g. 'Python', 'Mobile App')..." 
                  className="w-full bg-transparent border-none py-3 px-4 text-white focus:outline-none placeholder:text-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="mr-4 text-gray-500 hover:text-white">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setSelectedType(filter)}
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                    selectedType === filter
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-background border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* ADVANCED FILTERS */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div 
                className="flex items-center gap-2 cursor-pointer w-fit select-none group" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'bg-white/5 text-textMuted group-hover:text-white'}`}>
                    <Filter size={18} />
                </div>
                <span className={`text-sm font-medium transition-colors ${showFilters ? 'text-white' : 'text-textMuted group-hover:text-white'}`}>
                  Advanced Filters
                </span>
                {selectedSkills.length > 0 && (
                  <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full ml-1 font-bold">
                    {selectedSkills.length}
                  </span>
                )}
              </div>

              {(showFilters || selectedSkills.length > 0) && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[300px] max-w-full">
                  <SkillSelector 
                    selectedSkills={selectedSkills} 
                    setSelectedSkills={setSelectedSkills} 
                    showLabel={false} 
                  />
                </div>
              )}
            </div>

            {user && userSkills.length > 0 && (
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  showRecommended 
                    ? 'bg-gradient-to-r from-purple-500/20 to-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : 'bg-background border-white/10 text-textMuted hover:border-white/30 hover:text-white'
                }`}
              >
                <Sparkles size={16} className={showRecommended ? 'text-yellow-300' : ''} />
                <span className="text-sm font-medium">For You</span>
              </button>
            )}
          </div>

          {/* STATUS BAR */}
          {(searchTerm || selectedType !== 'All' || selectedSkills.length > 0 || showRecommended) && (
            <div className="flex justify-between items-center text-xs text-textMuted border-t border-white/5 pt-4">
              <span className="italic">
                 Found {projects.length} results based on your criteria.
              </span>
              <button 
                onClick={clearFilters}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors hover:underline"
              >
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}

        </div>
      </div>

      {/* WYNIKI */}
      {loading && projects.length === 0 ? (
        <div className="flex justify-center py-20 text-primary">
          <Loader2 size={40} className="animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-white/5">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
             <Search size={32} />
          </div>
          <p className="text-xl text-white mb-2 font-bold">No projects found</p>
          <p className="text-textMuted max-w-md mx-auto">
            We couldn't find any projects matching "{searchTerm || 'your filters'}". Try using different keywords or clearing filters.
          </p>
          <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors border border-white/10">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={{
                  ...project,
                  tags: project.skills || [],
                  timePosted: new Date(project.created_at).toLocaleDateString(),
                  membersCurrent: project.members_current,
                  membersMax: project.members_max
                }}
                // Opcjonalnie: Przekazujemy searchTerm do karty, żeby mogła podświetlić tekst (wymaga edycji ProjectCard, ale to detail)
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="group flex items-center gap-2 px-8 py-3 bg-surface border border-white/10 rounded-xl text-white hover:bg-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowDownCircle size={20} className="group-hover:translate-y-1 transition-transform" />}
                {loading ? 'Loading...' : 'Load More Projects'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Projects;