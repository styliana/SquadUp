import { Calendar, Clock, Users } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const ProjectInfo = ({ project, userSkills }) => {
  
  // Funkcja sprawdzająca dopasowanie skilla
  const isSkillMatched = (skillName) => {
    return userSkills.some(skill => skill.toLowerCase() === skillName.toLowerCase());
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-8 mb-8 shadow-sm">
      
      {/* HEADER: Badge & Count */}
      <div className="flex justify-between items-start mb-6">
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
          {project.type}
        </span>
        <div className="flex items-center gap-2 text-textMuted">
          <Users size={18} />
          <span>{project.members_current}/{project.members_max} Members</span>
        </div>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-bold text-textMain mb-6">
        {project.title}
      </h1>

      <div className="space-y-6">
        
        {/* DESCRIPTION */}
        <div>
          <h3 className="text-lg font-semibold text-textMain mb-2">Project Description</h3>
          <p className="text-textMuted leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>

        {/* SKILLS */}
        <div>
          <h3 className="text-lg font-semibold text-textMain mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {project.skills && project.skills.length > 0 ? (
              project.skills.map(skillName => {
                const isMatch = isSkillMatched(skillName);
                return (
                  <span 
                    key={skillName} 
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                      isMatch
                        ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium'
                        : 'bg-background border-border text-textMuted'
                    }`}
                  >
                    {skillName} {isMatch && '✨'}
                  </span>
                );
              })
            ) : (
              <span className="text-textMuted italic text-sm">No specific skills listed.</span>
            )}
          </div>
        </div>

        {/* FOOTER: Dates */}
        <div className="flex gap-6 pt-6 border-t border-border text-textMuted text-sm">
          <div className="flex items-center gap-2"><Calendar size={16} /><span className="truncate">Deadline: {project.deadline || 'Flexible'}</span></div>
          <div className="flex items-center gap-2"><Clock size={16} /><span>Posted: {formatDate(project.created_at)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;