import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, MessageCircle, Send, Loader2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar'; 
import { toast } from 'sonner';
import { useProjectDetails } from '../hooks/useProjectDetails';
import { formatDate } from '../utils/formatDate';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { project, loading } = useProjectDetails(id);

  const [hasApplied, setHasApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [userSkills, setUserSkills] = useState([]);

  const backPath = location.state?.from || '/projects';
  const backLabel = backPath === '/my-projects' ? 'Back to My Projects' : 'Back to projects';

  // Sprawdzenie czy użytkownik już aplikował
  useEffect(() => {
    if (user && id) {
      const checkApplicationStatus = async () => {
        const { data } = await supabase
          .from('applications')
          .select('id') 
          .eq('project_id', id)
          .eq('applicant_id', user.id)
          .maybeSingle();

        if (data) setHasApplied(true);
      };
      checkApplicationStatus();
    }
  }, [id, user]);

  // Pobieranie umiejętności zalogowanego użytkownika (Relacyjnie)
  useEffect(() => {
    if (user) {
      const fetchUserSkills = async () => {
        const { data } = await supabase
          .from('profiles')
          .select(`
            profile_skills (
              skills ( name )
            )
          `)
          .eq('id', user.id)
          .maybeSingle();

        if (data?.profile_skills) {
          const flatSkills = data.profile_skills.map(ps => ps.skills.name);
          setUserSkills(flatSkills);
        }
      };
      fetchUserSkills();
    }
  }, [user]);

  const handleApply = async () => {
    if (!user) {
      toast.error("You must be logged in to apply.");
      navigate('/login');
      return;
    }
    if (!applicationMessage.trim()) {
      toast.warning("Please write a short message.");
      return;
    }

    setApplyLoading(true);
    const { error } = await supabase
      .from('applications')
      .insert([{ 
          project_id: id, 
          applicant_id: user.id,
          message: applicationMessage 
      }]);

    setApplyLoading(false);

    if (error) {
      console.error(error);
      toast.error(error.message.includes('unique') ? "You already applied!" : "Failed to send application.");
    } else {
      setHasApplied(true);
      toast.success("Application sent successfully!");
    }
  };

  const handleSendMessage = () => {
    if (!user) {
      toast.error("Please log in to send a message.");
      navigate('/login');
      return;
    }
    
    navigate('/chat', { 
      state: { 
        startChatWith: project.profiles || { 
          id: project.author_id, 
          full_name: project.author, 
          email: 'Leader' 
        } 
      } 
    });
  };

  const isSkillMatched = (skillName) => {
    return userSkills.some(skill => skill.toLowerCase() === skillName.toLowerCase());
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!project) return <div className="text-center py-20 text-textMain">Project not found 😢</div>;

  const openSpots = project.members_max - project.members_current;
  const isAuthor = user && project.author_id === user.id;
  const author = project.profiles; 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to={backPath} className="inline-flex items-center gap-2 text-textMuted hover:text-textMain mb-8 transition-colors">
        <ArrowLeft size={20} />
        {backLabel}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                {project.type}
              </span>
              <div className="flex items-center gap-2 text-textMuted">
                <Users size={18} />
                <span>{project.members_current}/{project.members_max} Members</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-textMain mb-6">
              {project.title}
            </h1>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-textMain mb-2">Project Description</h3>
                <p className="text-textMuted leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

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

              <div className="flex gap-6 pt-6 border-t border-border text-textMuted text-sm">
                <div className="flex items-center gap-2"><Calendar size={16} /><span className="truncate">Deadline: {project.deadline}</span></div>
                <div className="flex items-center gap-2"><Clock size={16} /><span>Posted: {formatDate(project.created_at)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
                <div className="text-sm text-textMuted">{project.role}</div>
                {author?.university && (
                  <div className="text-xs text-primary mt-0.5 truncate">{author.university}</div>
                )}
              </div>
            </Link>
            
            {!isAuthor && (
              <button 
                onClick={handleSendMessage}
                className="w-full py-3 rounded-xl border border-border text-textMain font-medium hover:bg-textMain/5 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Send Message
              </button>
            )}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-textMain mb-2">
              {openSpots > 0 ? `${openSpots} Open Spots` : 'Team Full'}
            </h3>

            <div className="mb-6 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-textMuted mb-3 flex items-center gap-2">
                <Users size={16} /> The Squad
              </h4>
              <div className="flex flex-wrap gap-2">
                <div className="relative group cursor-pointer" title="Leader">
                  <UserAvatar 
                    avatarUrl={author?.avatar_url} 
                    name={author?.full_name} 
                    className="w-10 h-10 border-2 border-primary" 
                  />
                  <span className="absolute -bottom-1 -right-1 bg-primary text-black text-[9px] font-bold px-1 rounded-full">L</span>
                </div>

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

                {[...Array(Math.max(0, project.members_max - project.members_current))].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-dashed border-border flex items-center justify-center text-textMuted">
                    <User size={16} />
                  </div>
                ))}
              </div>
            </div>
            
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
                  placeholder="Short message to the leader..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                />
                <button 
                  onClick={handleApply}
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
      </div>
    </div>
  );
};

export default ProjectDetails;