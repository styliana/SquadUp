import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECT_TYPE_STYLES } from '../utils/constants';
import UserAvatar from './UserAvatar'; // Dodany import

const ProjectCard = ({ project }) => {
  
  const getBadgeStyle = (type) => {
    return PROJECT_TYPE_STYLES[type] || PROJECT_TYPE_STYLES['Default'];
  };

  // Dane autora z relacji (jeśli dostępne) lub fallback do starych pól
  const authorName = project.profiles?.full_name || project.author || 'Anonymous';
  const authorAvatar = project.profiles?.avatar_url;
  const authorUni = project.profiles?.university;

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group flex flex-col h-full relative overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(project.type)}`}>
          {project.type}
        </span>
        <div className="flex items-center gap-2 text-textMuted text-sm">
          <User size={16} />
          <span>{project.membersCurrent || project.members_current}/{project.membersMax || project.members_max}</span>
        </div>
      </div>

      {/* TEXT */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
        {project.title}
      </h3>
      
      {/* AUTHOR INFO (NOWE) */}
      <div className="flex items-center gap-2 mb-4">
        <UserAvatar avatarUrl={authorAvatar} name={authorName} className="w-6 h-6" textSize="text-xs" />
        <span className="text-xs text-gray-400 truncate max-w-[150px]">
          by <span className="text-gray-300 font-medium">{authorName}</span>
        </span>
      </div>

      <p className="text-textMuted text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
        {project.description}
      </p>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-md bg-background border border-white/10 text-xs text-gray-300">
            {tag}
          </span>
        ))}
        {project.tags.length > 3 && (
          <span className="px-2.5 py-1 rounded-md bg-background border border-white/10 text-xs text-gray-500">
            +{project.tags.length - 3}
          </span>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-textMuted">
          <Calendar size={14} />
          <span>{project.deadline || project.timePosted}</span>
        </div>
        
        <Link 
          to={`/projects/${project.id}`} 
          state={{ from: '/projects' }}
          className="flex items-center gap-2 text-white font-medium text-sm group/btn cursor-pointer hover:text-primary transition-colors"
        >
           Details
           <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;