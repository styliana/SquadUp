import { useEffect, useState } from 'react';
import { Search, Filter, Loader2, X, Sparkles, ArrowDownCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import SkillSelector from '../components/SkillSelector';
import { useProjects } from '../hooks/useProjects';
import ProjectCardSkeleton from '../components/skeletons/ProjectCardSkeleton';
import useThrowAsyncError from '../hooks/useThrowAsyncError';

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

  const hasUserPreferences = userProfile.skills.length > 0 || userProfile.preferred_categories.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-textMain mb-4">
          Find a <span className="text-primary">Project</span>
        </h1>
        <p className="text-textMuted mb-8">
          Find a project that matches your skills and interests.
        </p>

        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-6">
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow group">
              <div className={`absolute inset-0 bg-primary/20 rounded-xl blur-md transition-opacity ${searchTerm ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="relative bg-background rounded-xl border border-border flex items-center overflow-hidden focus-within:border-primary transition-colors">
                <Search className="ml-4 text-textMuted" size={20} />
                <input 
                  type="text" 
                  placeholder="Search projects (e.g. 'Python', 'Mobile App')..." 
                  className="w-full bg-transparent border-none py-3 px-4 text-textMain focus:outline-none placeholder:text-textMuted"
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
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                    selectedType === filter
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-background border-border text-textMuted hover:text-textMain hover:border-primary/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div 
                className="flex items-center gap-2 cursor-pointer w-fit select-none group" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'bg-textMain/5 text-textMuted group-hover:text-textMain'}`}>
                    <Filter size={18} />
                </div>
                <span className={`text-sm font-medium transition-colors ${showFilters ? 'text-textMain' : 'text-textMuted group-hover:text-textMain'}`}>
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

            {user && hasUserPreferences && (
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  showRecommended 
                    ? 'bg-gradient-to-r from-purple-500/20 to-primary/20 border-primary/50 text-textMain dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : 'bg-background border-border text-textMuted hover:border-primary/50 hover:text-textMain'
                }`}
              >
                <Sparkles size={16} className={showRecommended ? 'text-yellow-500 dark:text-yellow-300' : ''} />
                <span className="text-sm font-medium">For You</span>
              </button>
            )}
          </div>

          {(searchTerm || selectedType !== 'All' || selectedSkills.length > 0 || showRecommended) && (
            <div className="flex justify-between items-center text-xs text-textMuted border-t border-border pt-4">
              <span className="italic">
                 Found {projects.length} results based on your criteria.
              </span>
              <button onClick={clearFilters} className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors hover:underline">
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-border">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-textMuted">
             <Search size={32} />
          </div>
          <p className="text-xl text-textMain mb-2 font-bold">No projects found</p>
          <p className="text-textMuted max-w-md mx-auto">
            We couldn't find any projects matching your filters. Try clearing them to see more results.
          </p>
          <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-surface hover:bg-surface/80 rounded-lg text-textMain text-sm transition-colors border border-border">
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
                userSkills={userProfile?.skills || []}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="group flex items-center gap-2 px-8 py-3 bg-surface border border-border rounded-xl text-textMain hover:bg-background hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all disabled:opacity-50"
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