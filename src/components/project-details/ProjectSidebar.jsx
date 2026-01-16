import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MessageCircle, Send, Loader2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

const ProjectSidebar = ({ 
  project, 
  author, 
  user, 
  isAuthor, 
  hasApplied, 
  onApply, 
  onSendMessage, 
  applyLoading 
}) => {
  const [message, setMessage] = useState("");
  
  const openSpots = project.members_max - project.members_current;

  // Handler dla przycisku Apply, przekazuje wiadomość wyżej
  const handleSubmitApply = () => {
    onApply(message);
  };

  return (
    <div className="space-y-6">
      
      {/* CARD 1: TEAM LEADER */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-textMain mb-4">Team Leader</h3>
        
        <Link to={`/profile/${project.author_id}`} className="flex items-center gap-4 mb-6 hover:bg-textMain/5 p-2 rounded-xl transition-colors group">
          <UserAvatar 
            avatarUrl={author?.avatar_url} 
            name={author?.full_name || project.author} 
            className="w-14 h-14" 
            textSize="text-xl"
          />
          <div className="min-w-0">
            <div className="font-bold text-textMain text-lg truncate group-hover:text-primary transition-colors">
              {author?.full_name || project.author}
            </div>
            <div className="text-sm text-textMuted">{project.role || 'Leader'}</div>
            {author?.university && (
              <div className="text-xs text-primary mt-0.5 truncate">{author.university}</div>
            )}
          </div>
        </Link>
        
        {!isAuthor && (
          <button 
            onClick={onSendMessage}
            className="w-full py-3 rounded-xl border border-border text-textMain font-medium hover:bg-textMain/5 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Send Message
          </button>
        )}
      </div>

      {/* CARD 2: TEAM STATUS & APPLICATION */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-textMain mb-2">
          {openSpots > 0 ? `${openSpots} Open Spots` : 'Team Full'}
        </h3>

        <div className="mb-6 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-textMuted mb-3 flex items-center gap-2">
            <Users size={16} /> The Squad
          </h4>
          <div className="flex flex-wrap gap-2">
            
            {/* Leader Avatar */}
            <div className="relative group cursor-pointer" title="Leader">
              <UserAvatar 
                avatarUrl={author?.avatar_url} 
                name={author?.full_name} 
                className="w-10 h-10 border-2 border-primary" 
              />
              <span className="absolute -bottom-1 -right-1 bg-primary text-black text-[9px] font-bold px-1 rounded-full">L</span>
            </div>

            {/* Accepted Members */}
            {project.applications
              ?.filter(app => app.status === 'accepted')
              .map(app => (
                <Link 
                  key={app.id} 
                  to={`/profile/${app.profiles?.id}`}
                  className="relative group transition-transform hover:scale-105"
                  title={app.profiles?.full_name}
                >
                  <UserAvatar 
                    avatarUrl={app.profiles?.avatar_url} 
                    name={app.profiles?.full_name} 
                    className="w-10 h-10" 
                  />
                </Link>
              ))
            }

            {/* Empty Slots */}
            {[...Array(Math.max(0, project.members_max - project.members_current))].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full border border-dashed border-border flex items-center justify-center text-textMuted">
                <User size={16} />
              </div>
            ))}
          </div>
        </div>
        
        {/* ACTIONS AREA */}
        {isAuthor ? (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <strong>Your Project</strong><br/>
              Manage applications in your dashboard.
            </div>
          </div>
        ) : hasApplied ? (
          <button disabled className="w-full mt-4 py-3 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400 font-bold border border-green-500/50 flex items-center justify-center gap-2">
            <CheckCircle size={18} />
            Application Sent
          </button>
        ) : openSpots > 0 ? (
          <>
            <textarea 
              className="w-full bg-background border border-border rounded-xl p-3 text-textMain text-sm mb-4 focus:outline-none focus:border-primary resize-none"
              rows={3}
              maxLength={500}
              placeholder="Short message to the leader..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button 
              onClick={handleSubmitApply}
              disabled={applyLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {applyLoading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Apply for Project</>}
            </button>
          </>
        ) : (
          <p className="text-textMuted text-sm">This project is currently full.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;