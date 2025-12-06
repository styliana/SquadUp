import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project }) => {
  // Funkcja do kolorowania badge'y w zależności od typu
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
      
      {/* HEADER: Typ i Liczba miejsc */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(project.type)}`}>
          {project.type}
        </span>
        <div className="flex items-center gap-2 text-textMuted text-sm">
          <User size={16} />
          <span>{project.membersCurrent}/{project.membersMax} Spots</span>
        </div>
      </div>

      {/* TYTUŁ I OPIS */}
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      <p className="text-textMuted text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
        {project.description}
      </p>

      {/* TAGI */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-md bg-background border border-white/10 text-xs text-gray-300">
            {tag}
          </span>
        ))}
        {/* Fake "+1" jeśli jest dużo tagów, tak jak na designie */}
        <span className="px-2.5 py-1 rounded-md bg-background border border-white/10 text-xs text-gray-400">
          +1
        </span>
      </div>

      {/* FOOTER: Deadline, Autor i Przycisk */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <Calendar size={14} />
            <span>Deadline: {project.deadline}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <Clock size={14} />
            <span>{project.timePosted}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white font-medium text-sm group/btn cursor-pointer">
           Details
           <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-primary" />
        </div>
      </div>

      {/* Autor Avatar (Małe kółko) */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
            {project.author.charAt(0)}
        </div>
        <div className="text-sm">
            <p className="text-white text-xs">{project.author}</p>
        </div>
      </div>

    </div>
  );
};

export default ProjectCard;