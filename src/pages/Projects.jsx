import { useEffect, useState } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Import klienta
import ProjectCard from '../components/ProjectCard';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pobieranie danych z Supabase
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    
    // Zapytanie do bazy
    let { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false }); // Najnowsze na górze

    if (error) {
      console.error('Błąd pobierania:', error);
    } else {
      setProjects(data);
    }
    setLoading(false);
  };

  // Proste filtrowanie po nazwie (client-side)
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Find a <span className="text-primary">Project</span>
        </h1>
        <p className="text-textMuted mb-8">
          Find a project that matches your skills and interests.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-primary">
          <Loader2 size={40} className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            // Mapujemy dane z bazy na propsy karty
            <ProjectCard 
              key={project.id} 
              project={{
                ...project,
                tags: project.skills, // W bazie mamy 'skills', komponent oczekuje 'tags'
                timePosted: new Date(project.created_at).toLocaleDateString(), // Formatowanie daty
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