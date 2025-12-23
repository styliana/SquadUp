import { ArrowLeft, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../UserAvatar';
import StatusBadge from '../StatusBadge';

const ProjectHeader = ({ project, isOwner, onDelete, user }) => {
  const navigate = useNavigate();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Tu można dodać toast "Link copied!"
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl bg-surface border border-border text-textMuted hover:text-textMain hover:border-primary/50 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-textMain mb-2">{project.title}</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {project.type}
            </span>
            <StatusBadge status={project.status_id === 2 ? 'closed' : 'open'} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleShare} className="p-2.5 rounded-xl bg-surface border border-border text-textMuted hover:text-primary transition-all">
          <Share2 size={20} />
        </button>
        
        {isOwner && (
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
            <button 
              onClick={() => navigate(`/edit-project/${project.id}`)}
              className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-blue-400 transition-colors"
              title="Edit Project"
            >
              <Edit size={18} />
            </button>
            <div className="w-px h-6 bg-border"></div>
            <button 
              onClick={onDelete}
              className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-red-400 transition-colors"
              title="Delete Project"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;