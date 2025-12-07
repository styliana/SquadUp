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
  
  // Stany ładowania i paginacji
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filtry
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);

  // 1. Inicjalizacja (Kategorie i Skille usera)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Kategorie
      const { data: catData } = await supabase.from('categories').select('name');
      if (catData) setCategories(['All', ...catData.map(c => c.name)]);

      // Skille usera (do rekomendacji)
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

  // 2. Główna funkcja pobierająca projekty (Server-Side)
  const fetchProjects = useCallback(async (pageIndex, isReset = false) => {
    try {
      setLoading(true);
      
      // Budowanie zapytania
      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' }); // count potrzebny do paginacji

      // A. Wyszukiwanie (Tytuł LUB Opis)
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // B. Typ projektu
      if (selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      // C. Skille (Czy projekt zawiera wymagane skille)
      if (selectedSkills.length > 0) {
        query = query.contains('skills', selectedSkills);
      }

      // D. Sortowanie i Paginacja
      // Domyślnie sortujemy od najnowszych
      query = query
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Logika rekomendacji (Sortowanie po stronie klienta pobranej partii)
      // Uwaga: Idealna rekomendacja wymagałaby funkcji RPC w bazie danych, 
      // ale na potrzeby inżynierki sortowanie 'strony' jest akceptowalnym kompromisem UX.
      let processedData = data || [];
      if (showRecommended && userSkills.length > 0) {
        processedData = processedData.map(p => {
          const matchCount = p.skills?.filter(s => userSkills.includes(s)).length || 0;
          return { ...p, matchScore: matchCount };
        }).sort((a, b) => b.matchScore - a.matchScore);
      }

      // Aktualizacja stanu
      if (isReset) {
        setProjects(processedData);
      } else {
        setProjects(prev => [...prev, ...processedData]);
      }

      // Sprawdzenie czy jest więcej danych
      if (count !== null) {
        setHasMore((pageIndex + 1) * PAGE_SIZE < count);
      }

    } catch (error) {
      console.error('Błąd pobierania:', error);
      toast.error("Nie udało się pobrać projektów.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedSkills, showRecommended, userSkills]);

  // 3. Resetowanie i pobieranie przy zmianie filtrów
  useEffect(() => {
    // Resetujemy stronę na 0 i czyścimy listę przy każdej zmianie filtra
    setPage(0);
    setHasMore(true);
    // Debounce dla search term mógłby być dodany, ale tutaj dla czytelności robimy bezpośrednio
    const timeoutId = setTimeout(() => {
      fetchProjects(0, true);
    }, 300); // Mały delay żeby nie strzelać przy każdej literze
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType, selectedSkills, showRecommended, fetchProjects]);

  // 4. Obsługa "Load More"
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
            
            <div className="flex gap-2 overflow-x-autoXH pb-2 md:pb-0 scrollbar-hide">
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
                className="flex items-center gap-2 cursor-pointer w-fit select-none" 
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
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[300px] max-w-full">
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

          {(searchTerm || selectedType !== 'All' || selectedSkills.length > 0 || showRecommended) && (
            <div className="flex justify-between items-center text-xs text-textMuted border-t border-white/5 pt-4">
              <span>
                {/* Opcjonalny licznik wyników */}
              </span>
              <button 
                onClick={clearFilters}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
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
          <p className="text-xl text-white mb-2">No projects found 🧐</p>
          <p className="text-textMuted">Try adjusting your filters or search terms.</p>
          <button onClick={clearFilters} className="mt-4 text-primary hover:underline">Reset filters</button>
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
              />
            ))}
          </div>

          {/* Przycisk Load More */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-surface border border-white/10 rounded-xl text-white hover:bg-white/5 hover:border-white/20 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowDownCircle size={20} />}
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