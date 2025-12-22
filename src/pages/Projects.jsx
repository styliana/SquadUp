import { useEffect, useState } from 'react';
import { Search, Filter, Loader2, X, Sparkles, ArrowDownCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import SkillSelector from '../components/SkillSelector';
import { useProjects } from '../hooks/useProjects';
import ProjectCardSkeleton from '../components/skeletons/ProjectCardSkeleton';

const Projects = () => {
  const { user } = useAuth();
  const { projects, loading, hasMore, fetchProjects, userProfile } = useProjects(user);

  const [categories, setCategories] = useState(['All']);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);

  // Pobieranie kategorii
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('name');
        if (error) throw error;
        if (data) setCategories(['All', ...data.map(c => c.name)]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Obsługa filtrów i wyszukiwania (Debounce)
  useEffect(() => {
    setPage(0);
    const timeoutId = setTimeout(() => {
      fetchProjects({
        page: 0,
        searchTerm,
        selectedType,
        selectedSkills,
        showRecommended
      }, true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType, selectedSkills, showRecommended, fetchProjects]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects({
      page: nextPage,
      searchTerm,
      selectedType,
      selectedSkills,
      showRecommended
    }, false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedSkills([]);
    setShowRecommended(false);
  };

  // Sprawdzanie preferencji do sekcji "For You"
  const hasUserPreferences = (userProfile.skills?.length > 0) || (userProfile.preferred_categories?.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-textMain mb-4">
          Find a <span className="text-primary">Project</span>
        </h1>
        <p className="text-textMuted mb-8">
          Find a project that matches your skills and interests.
        </p>

        {/* SEARCH & FILTERS BOX */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow group">
              <div className={`absolute inset-0 bg-primary/20 rounded-xl blur-md transition-opacity ${searchTerm ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="relative bg-background rounded-xl border border-border flex items-center overflow-hidden focus-within:border-primary transition-colors">
                <Search className="ml-4 text-textMuted" size={20} />
                <input 
                  type="text" 
                  placeholder="Search projects (e.g. 'React', 'Mobile')..." 
                  className="w-full bg-transparent border-none py-3 px-4 text-textMain focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="mr-4 text-textMuted hover:text-textMain">
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
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition-all border ${
                    selectedType === filter
                    ? 'bg-primary/20 border-primary text-primary shadow-lg' 
                    : 'bg-background border-border text-textMuted hover:border-primary/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'bg-surface text-textMuted group-hover:text-textMain'}`}>
                <Filter size={18} />
              </div>
              <span className="text-sm font-medium text-textMuted group-hover:text-textMain">Advanced Filters</span>
            </div>

            {user && hasUserPreferences && (
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  showRecommended 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-background border-border text-textMuted hover:text-textMain'
                }`}
              >
                <Sparkles size={16} />
                <span className="text-sm font-medium">For You</span>
              </button>
            )}
          </div>

          {(showFilters || selectedSkills.length > 0) && (
            <div className="mt-4 p-4 bg-background/50 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
              <SkillSelector 
                selectedSkills={selectedSkills} 
                setSelectedSkills={setSelectedSkills} 
                showLabel={true} 
              />
            </div>
          )}
        </div>
      </div>

      {/* PROJECTS GRID */}
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-border">
          <p className="text-xl text-textMain font-bold">No projects found</p>
          <button onClick={clearFilters} className="mt-4 text-primary hover:underline text-sm">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={{
                  ...project,
                  tags: project.skills, // Nasz hook już to zmapował na tablicę stringów
                  timePosted: new Date(project.created_at).toLocaleDateString(),
                  membersCurrent: project.members_current,
                  membersMax: project.members_max
                }}
                userSkills={userProfile.skills || []}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-surface border border-border rounded-xl text-textMain hover:border-primary/50 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowDownCircle size={20} />}
                Load More Projects
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Projects;