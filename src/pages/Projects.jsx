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
  
  // Dane profilu zalogowanego użytkownika (do rekomendacji)
  const [userProfile, setUserProfile] = useState({
    skills: [],
    preferred_categories: []
  });
  
  // Stany UI
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filtry
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);

  // 1. Inicjalizacja (Pobranie kategorii i profilu usera)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Kategorie
      const { data: catData } = await supabase.from('categories').select('name');
      if (catData) setCategories(['All', ...catData.map(c => c.name)]);

      // Profil usera (Skille + Preferencje)
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('skills, preferred_categories')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setUserProfile({
            skills: profileData.skills || [],
            preferred_categories: profileData.preferred_categories || []
          });
        }
      }
    };
    fetchInitialData();
  }, [user]);

  // 2. Główna funkcja pobierająca projekty
  const fetchProjects = useCallback(async (pageIndex, isReset = false) => {
    try {
      setLoading(true);
      if (isReset) toast.dismiss();

      let query;

      // A. LOGIKA WYSZUKIWANIA (RPC vs Standard)
      if (searchTerm) {
        // Używamy funkcji SQL do przeszukiwania tytułu, opisu i tagów
        query = supabase.rpc('search_projects', { keyword: searchTerm });
      } else {
        query = supabase.from('projects').select('*', { count: 'exact' });
      }

      // B. FILTR STATUSU (Tylko otwarte projekty - poziom bazy danych)
      query = query.eq('status', 'open');

      // C. FILTROWANIE POZOSTAŁE
      if (selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      if (selectedSkills.length > 0) {
        query = query.contains('skills', selectedSkills);
      }

      // D. SORTOWANIE I PAGINACJA
      query = query.range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

      if (!searchTerm) {
         query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // --- E. PODWÓJNE ZABEZPIECZENIE (Filtr Frontendowy) ---
      // Nawet jeśli baza zwróci projekt jako 'open', ukrywamy go, jeśli jest pełny.
      let filteredData = (data || []).filter(p => p.members_current < p.members_max);

      // F. LOGIKA REKOMENDACJI (Client-side Sorting)
      const hasPreferences = userProfile.skills.length > 0 || userProfile.preferred_categories.length > 0;

      if (showRecommended && hasPreferences) {
        filteredData = filteredData.map(p => {
          let score = 0;
          
          // 1. Punkty za pasujące skille (+1)
          const skillMatches = p.skills?.filter(s => userProfile.skills.includes(s)).length || 0;
          score += skillMatches; 

          // 2. Punkty za pasującą kategorię (+2)
          if (userProfile.preferred_categories.includes(p.type)) {
            score += 2;
          }

          return { ...p, matchScore: score };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
      }

      // G. AKTUALIZACJA STANU
      if (isReset) {
        setProjects(filteredData);
      } else {
        setProjects(prev => [...prev, ...filteredData]);
      }

      // Sprawdzenie czy jest więcej danych
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (error) {
      console.error('Błąd:', error);
      if (error.code !== 'PX000' && error.name !== 'AbortError') {
         // Cichy błąd
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedSkills, showRecommended, userProfile]);

  // 3. Efekty - wywoływanie pobierania przy zmianie filtrów
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    
    const timeoutId = setTimeout(() => {
      fetchProjects(0, true);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType, selectedSkills, showRecommended, fetchProjects]);

  // 4. Obsługa przycisków
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

  const hasUserPreferences = userProfile.skills.length > 0 || userProfile.preferred_categories.length > 0;

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
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
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
            
            {/* Kategorie (Pigułki) */}
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

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filtr Skilli */}
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

            {/* Przycisk "For You" */}
            {user && hasUserPreferences && (
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

          {/* Status filtrów */}
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