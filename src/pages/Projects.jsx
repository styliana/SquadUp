import { Search, Filter } from 'lucide-react';
import { PROJECTS } from '../data/mockProjects';
import ProjectCard from '../components/ProjectCard';

const Projects = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* NAGŁÓWEK I WYSZUKIWARKA */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Find a <span className="text-primary">Project</span>
        </h1>
        <p className="text-textMuted mb-8">
          Find a project that matches your skills and interests.
        </p>

        {/* Pasek wyszukiwania */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search projects (e.g. React, AI, Space)..." 
              className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
            />
          </div>
          
          {/* Proste przyciski filtrów */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Hackathon', 'Competition', 'Portfolio', 'Startup'].map((filter, index) => (
              <button 
                key={filter}
                className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
                  index === 0 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-surface border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Pasek filtrów technologii (opcjonalny, wizualny) */}
        <div className="flex items-center gap-3 mt-6 text-sm text-textMuted">
          <Filter size={16} />
          <span>Skills:</span>
          {['React', 'Python', 'Figma', 'Node.js', 'TypeScript'].map(skill => (
            <button key={skill} className="hover:text-primary transition-colors">
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* SIATKA PROJEKTÓW (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

    </div>
  );
};

export default Projects;