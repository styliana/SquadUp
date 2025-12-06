import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'Hackathon': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Competition': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Portfolio': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group flex flex-col h-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(project.type)}`}>
          {project.type}
        </span>
        <div className="flex items-center gap-2 text-textMuted text-sm">
          <User size={16} />
          <span>{project.membersCurrent}/{project.membersMax} Spots</span>
        </div>
      </div>

      {/* TEXT */}
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      <p className="text-textMuted text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
        {project.description}
      </p>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-md bg-background border border-white/10 text-xs text-gray-300">
            {tag}
          </span>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-textMuted">
          <Calendar size={14} />
          <span>{project.deadline}</span>
        </div>
        
        {/* BUTTON - TERAZ JEST LINKIEM */}
        <Link to={`/projects/${project.id}`} className="flex items-center gap-2 text-white font-medium text-sm group/btn cursor-pointer hover:text-primary transition-colors">
           Details
           <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;