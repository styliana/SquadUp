import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // ZMIANA: dodano useLocation
import { ArrowLeft, Calendar, Clock, User, MessageCircle, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar'; 
import { toast } from 'sonner';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ZMIANA: hook lokalizacji
  
  // Odbieramy "skąd przyszedłem", domyślnie '/projects'
  const backPath = location.state?.from || '/projects';
  const backLabel = backPath === '/my-projects' ? 'Back to My Projects' : 'Back to projects';

  const [project, setProject] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    fetchProjectDetails();
    if (user) checkApplicationStatus();
  }, [id, user]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(projectData);

      if (projectData.author_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', projectData.author_id)
          .single();
        
        setAuthorProfile(profileData);
      }

    } catch (error) {
      console.error("Błąd pobierania:", error);
      toast.error("Project not found.");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', id)
      .eq('applicant_id', user.id)
      .single();

    if (data) setHasApplied(true);
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("You must be logged in to apply.");
      navigate('/login');
      return;
    }
    
    if (!applicationMessage.trim()) {
      toast.warning("Please write a short message to the leader.");
      return;
    }

    setApplyLoading(true);
    const { error } = await supabase
      .from('applications')
      .insert([
        { 
          project_id: id, 
          applicant_id: user.id,
          message: applicationMessage 
        }
      ]);

    setApplyLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to send application.");
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
        startChatWith: authorProfile || { 
          id: project.author_id, 
          full_name: project.author, 
          email: 'Leader' 
        } 
      } 
    });
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!project) return <div className="text-center py-20 text-white">Project not found 😢</div>;

  const openSpots = project.members_max - project.members_current;
  const isAuthor = user && project.author_id === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ZMIANA: Dynamiczny link powrotu */}
      <Link to={backPath} className="inline-flex items-center gap-2 text-textMuted hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} />
        {backLabel}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA STRONA */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-white/5 rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                {project.type}
              </span>
              <div className="flex items-center gap-2 text-textMuted">
                <User size={18} />
                <span>{project.members_current}/{project.members_max} Members</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {project.title}
            </h1>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Project Description</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills?.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-sm text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 pt-6 border-t border-white/5 text-textMuted text-sm">
                <div className="flex items-center gap-2"><Calendar size={16} /><span>Deadline: {project.deadline}</span></div>
                <div className="flex items-center gap-2"><Clock size={16} /><span>Posted: {new Date(project.created_at).toLocaleDateString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* PRAWA STRONA - LIDER I AKCJE */}
        <div className="space-y-6">
          
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Team Leader</h3>
            
            {project.author_id ? (
              <Link to={`/profile/${project.author_id}`} className="flex items-center gap-4 mb-6 hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer group">
                <UserAvatar 
                  avatarUrl={authorProfile?.avatar_url} 
                  name={authorProfile?.full_name || project.author} 
                  className="w-14 h-14" 
                  textSize="text-xl"
                />
                <div className="min-w-0">
                  <div className="font-bold text-white text-lg truncate group-hover:text-primary transition-colors">
                    {authorProfile?.full_name || project.author}
                  </div>
                  <div className="text-sm text-textMuted">{project.role}</div>
                  {authorProfile?.university && (
                    <div className="text-xs text-primary mt-0.5 truncate">{authorProfile.university}</div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4 mb-6 p-2">
                 <UserAvatar name={project.author} className="w-14 h-14" textSize="text-xl" />
                 <div>
                    <div className="font-bold text-white text-lg">{project.author}</div>
                    <div className="text-sm text-textMuted">{project.role}</div>
                 </div>
              </div>
            )}
            
            {!isAuthor && (
              <button 
                onClick={handleSendMessage}
                className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Send Message
              </button>
            )}
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              {openSpots > 0 ? `${openSpots} Open Spots` : 'Team Full'}
            </h3>
            
            {isAuthor ? (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Your Project</strong><br/>
                  Manage applications in your dashboard.
                </div>
              </div>
            ) : hasApplied ? (
              <button disabled className="w-full mt-4 py-3 rounded-xl bg-green-500/20 text-green-400 font-bold border border-green-500/50 flex items-center justify-center gap-2 cursor-default">
                <CheckCircle size={18} />
                Application Sent
              </button>
            ) : openSpots > 0 ? (
              <>
                <p className="text-textMuted text-sm mb-4">Apply now to join this project.</p>
                <textarea 
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-white text-sm mb-4 focus:outline-none focus:border-primary resize-none"
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