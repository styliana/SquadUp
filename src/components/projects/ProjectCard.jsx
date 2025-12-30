import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECT_TYPE_STYLES } from '../../utils/constants';
import UserAvatar from '../common/UserAvatar';
import { formatDate } from '../../utils/formatDate';
import Card from '../ui/Card';

const ProjectCard = ({ project, userSkills = [] }) => {
  
  const getBadgeStyle = (type) => {
    return PROJECT_TYPE_STYLES[type] || PROJECT_TYPE_STYLES['Default'];
  };

  const authorName = project.profiles?.full_name || project.author || 'Anonymous';
  const authorAvatar = project.profiles?.avatar_url;

  const skillsList = project.skills || project.tags || [];

  const isSkillMatched = (tag) => {
    return userSkills.some(skill => skill.toLowerCase() === tag.toLowerCase());
  };

  // 1. Opatulamy całość w Link. Dodajemy 'block h-full group', żeby karta wypełniała wysokość i obsługiwała hovery.
  return (
    <Link 
      to={`/projects/${project.id}`} 
      state={{ from: '/projects' }}
      className="block h-full group cursor-pointer" // cursor-pointer dla pewności
    >
      {/* 2. Usuwamy 'group' z Card (przeniesione wyżej) i usuwamy hover:shadow stąd, jeśli chcemy by działał na Linku */}
      <Card className="flex flex-col h-full relative overflow-hidden p-6 border-border group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        
        {/* HEADER: Badge & Members */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(project.type)}`}>
            {project.type}
          </span>
          <div className="flex items-center gap-2 text-textMuted text-sm">
            <User size={16} />
            <span>{project.membersCurrent || project.members_current}/{project.membersMax || project.members_max}</span>
          </div>
        </div>

        {/* TITLE */}
        {/* group-hover zadziała teraz idealnie, bo 'group' jest na rodzicu (Link) */}
        <h3 className="text-xl font-bold text-textMain mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {project.title}
        </h3>
        
        {/* AUTHOR */}
        <div className="flex items-center gap-2 mb-4">
          {/* Uwaga: Jeśli UserAvatar też jest linkiem, to może być konflikt. 
              Zakładam, że tu jest tylko wizualny. */}
          <UserAvatar avatarUrl={authorAvatar} name={authorName} className="w-6 h-6" textSize="text-xs" />
          <span className="text-xs text-textMuted truncate max-w-[150px]">
            by <span className="text-textMain font-medium">{authorName}</span>
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-textMuted text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
          {project.description}
        </p>

        {/* SKILLS / TAGS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skillsList.slice(0, 3).map((tag) => {
            const isMatch = isSkillMatched(tag);
            return (
              <span 
                key={tag} 
                className={`px-2.5 py-1 rounded-md text-xs transition-colors border ${
                  isMatch 
                    ? 'bg-primary/10 border-primary/40 text-primary font-medium shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                    : 'bg-background border-border text-textMuted'
                }`}
              >
                {tag}
              </span>
            );
          })}
          {skillsList.length > 3 && (
            <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs text-textMuted">
              +{skillsList.length - 3}
            </span>
          )}
        </div>

        {/* FOOTER: Dates & Action */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-textMuted">
             <div className="flex items-center gap-1.5" title="Date Posted">
               <Clock size={14} />
               <span>{formatDate(project.created_at)}</span>
             </div>
             <div className="flex items-center gap-1.5" title="Deadline">
               <Calendar size={14} />
               <span>{project.deadline || 'Flexible'}</span>
             </div>
          </div>
          
          {/* 3. Zmieniamy Link na div. Wygląda tak samo, ale nie jest zagnieżdżonym <a> */}
          <div 
            className="flex items-center gap-2 text-textMain font-medium text-sm group/btn group-hover:text-primary transition-colors"
          >
             Details
             <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProjectCard;