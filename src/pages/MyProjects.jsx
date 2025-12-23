import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MessageCircle, User, Check, X, Trash2, Edit2, Clock, Eye, Sparkles } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import UserAvatar from '../components/common/UserAvatar';
import StatusBadge from '../components/common/StatusBadge';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import useThrowAsyncError from '../hooks/useThrowAsyncError';
import { PROJECT_STATUS } from '../utils/constants'; 

const MyProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const throwAsyncError = useThrowAsyncError();
  
  const [createdProjects, setCreatedProjects] = useState([]);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published');

  const isProjectClosed = (project) => project.status_id === PROJECT_STATUS.CLOSED;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: myProjects, error: err1 } = await supabase
        .from('projects')
        .select(`
          *,
          categories ( name ),
          applications (
            *,
            profiles:applicant_id (*)
          )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (err1) throw err1;

      const projectsWithCount = (myProjects || []).map(p => {
        const acceptedCount = p.applications?.filter(a => a.status === 'accepted').length || 0;
        return {
          ...p,
          members_current: 1 + acceptedCount 
        };
      });

      const sortedMyProjects = projectsWithCount.sort((a, b) => {
        const aHasAction = a.applications?.some(app => app.status === 'pending');
        const bHasAction = b.applications?.some(app => app.status === 'pending');
        if (aHasAction && !bHasAction) return -1;
        if (!aHasAction && bHasAction) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setCreatedProjects(sortedMyProjects);

      const { data: myApplications, error: err2 } = await supabase
        .from('applications')
        .select(`
          *,
          projects!project_id (
            *,
            categories ( name )
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (err2) throw err2;
      setAppliedProjects(myApplications || []);

    } catch (error) {
      console.error("Critical Dashboard Error:", error);
      throwAsyncError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure? This will delete the project permanently.")) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      setCreatedProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success("Project deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project.");
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    toast("Are you sure?", {
      action: {
        label: "Yes, Withdraw",
        onClick: async () => {
          try {
            const { error } = await supabase.from('applications').delete().eq('id', applicationId);
            if (error) throw error;
            setAppliedProjects(prev => prev.filter(app => app.id !== applicationId));
            toast.success("Application withdrawn.");
          } catch (error) {
            console.error(error);
            toast.error("Failed to withdraw.");
          }
        }
      },
    });
  };

  const handleStatusChange = async (applicationId, projectId, newStatus) => {
    try {
      const targetProject = createdProjects.find(p => p.id === projectId);
      
      if (newStatus === 'accepted') {
        const { error } = await supabase.rpc('approve_candidate', { app_id: applicationId, proj_id: projectId });
        if (error) await supabase.from('applications').update({ status: newStatus }).eq('id', applicationId);

        // Obliczamy czy po tej akceptacji team jest pełny
        const newMembersCount = targetProject.members_current + 1;
        
        if (targetProject && newMembersCount >= targetProject.members_max) {
           // 1. Zamykamy projekt w bazie danych, aby zniknął z listy głównej
           await supabase
            .from('projects')
            .update({ status_id: PROJECT_STATUS.CLOSED })
            .eq('id', projectId);

           // 2. Wysyłamy wiadomość do wszystkich członków
           const recipients = targetProject.applications
             .filter(app => app.status === 'accepted' || app.id === applicationId)
             .map(app => app.applicant_id);

           const uniqueRecipients = [...new Set(recipients)];
           const messagesPayload = uniqueRecipients.map(recipientId => ({
               project_id: projectId,
               sender_id: user.id,
               recipient_id: recipientId,
               content: "We have a full team let's start working!"
           }));

           if (messagesPayload.length > 0) {
               supabase.from('messages').insert(messagesPayload).then(({ error }) => {
                   if (error) console.error("Message Error:", error);
                   else toast.success("Team full! Group message sent.");
               });
           }
        }
      } else {
        const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', applicationId);
        if (error) throw error;
      }

      // Aktualizacja UI
      setCreatedProjects(prev => prev.map(project => {
        if (project.id !== projectId) return project;
        
        const updatedApps = project.applications?.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ) || [];
        
        const acceptedCount = updatedApps.filter(a => a.status === 'accepted').length;
        const updatedMembers = 1 + acceptedCount;

        let updatedStatusId = project.status_id;
        if (updatedMembers >= project.members_max) {
            updatedStatusId = PROJECT_STATUS.CLOSED;
        } else {
            updatedStatusId = PROJECT_STATUS.OPEN;
        }

        return { 
            ...project, 
            status_id: updatedStatusId, 
            members_current: updatedMembers, 
            applications: updatedApps 
        };
      }));

      toast.success(newStatus === 'accepted' ? "Candidate accepted!" : "Candidate rejected.");

    } catch (error) {
      console.error(error);
      toast.error("Action failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-textMain flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20">
            <Briefcase className="text-textMain" size={24} />
          </div>
          My Dashboard
        </h1>
      </div>

      <div className="flex gap-6 border-b border-border mb-8">
        <button onClick={() => setActiveTab('published')} className={`pb-4 px-2 text-lg font-medium transition-all relative ${activeTab === 'published' ? 'text-textMain' : 'text-textMuted hover:text-textMain'}`}>
          Published Projects 
          {!loading && <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full text-textMuted">{createdProjects.length}</span>}
          {activeTab === 'published' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
        </button>
        <button onClick={() => setActiveTab('applied')} className={`pb-4 px-2 text-lg font-medium transition-all relative ${activeTab === 'applied' ? 'text-textMain' : 'text-textMuted hover:text-textMain'}`}>
          Applications Sent 
          {!loading && <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full text-textMuted">{appliedProjects.length}</span>}
          {activeTab === 'applied' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton activeTab={activeTab} />
      ) : (
        <>
          {activeTab === 'published' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {createdProjects.length === 0 ? (
                <div className="text-center py-24 bg-surface/30 rounded-3xl border border-dashed border-border">
                  <Sparkles className="mx-auto text-primary mb-4 opacity-50" size={48} />
                  <p className="text-xl text-textMain font-semibold mb-2">No projects yet</p>
                  <Link to="/create-project" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors inline-block">Create Project</Link>
                </div>
              ) : (
                createdProjects.map(project => (
                  <div key={project.id} className={`bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl ${isProjectClosed(project) ? 'opacity-75' : ''}`}>
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-textMain hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id}`, { state: { from: '/my-projects' } })}>
                            {project.title}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-border text-xs font-medium text-textMuted">
                            {project.categories?.name || 'Unknown'}
                          </span>
                          {isProjectClosed(project) && (
                            <span className="px-2.5 py-0.5 rounded-md bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400 flex items-center gap-1">
                                <Check size={12} /> TEAM FULL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-textMuted">
                          <span className="flex items-center gap-1.5"><Clock size={14} /> Created: {new Date(project.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><User size={14} /> {project.members_current}/{project.members_max} Members</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/projects/${project.id}`} state={{ from: '/my-projects' }} className="p-2 text-textMuted hover:text-textMain hover:bg-white/5 rounded-lg transition-colors"><Eye size={20} /></Link>
                        <button onClick={() => navigate(`/edit-project/${project.id}`)} className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit2 size={20} /></button>
                        <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={20} /></button>
                      </div>
                    </div>

                    <div className="p-6 bg-background border-t border-border">
                      {(!project.applications || project.applications.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-8 text-textMuted opacity-60">
                          <User size={32} className="mb-2" /><p>Waiting for candidates...</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {project.applications.map(app => (
                            <div key={app.id} className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-border transition-colors">
                              <div className="flex items-center gap-4 flex-grow w-full md:w-auto">
                                <div className="shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${app.profiles?.id}`)}>
                                  <UserAvatar avatarUrl={app.profiles?.avatar_url} name={app.profiles?.full_name} className="w-12 h-12" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-textMain text-base hover:underline cursor-pointer" onClick={() => navigate(`/profile/${app.profiles?.id}`)}>{app.profiles?.full_name || 'Anonymous'}</span>
                                    <span className="text-xs text-textMuted truncate">{app.profiles?.university}</span>
                                  </div>
                                  <div className="mt-1.5 text-sm text-textMuted bg-background border border-border p-3 rounded-lg border-l-4 border-l-primary italic">
                                    "{app.message}"
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 mt-3 md:mt-0 w-full md:w-auto justify-end">
                                {app.status === 'pending' ? (
                                  <>
                                    <button onClick={() => handleStatusChange(app.id, project.id, 'accepted')} className="flex items-center gap-1 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors text-sm font-medium"><Check size={16} /> Accept</button>
                                    <button onClick={() => handleStatusChange(app.id, project.id, 'rejected')} className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium"><X size={16} /> Reject</button>
                                  </>
                                ) : (<StatusBadge status={app.status} />)}
                                <div className="w-px h-8 bg-white/5 mx-2 hidden md:block"></div>
                                <Link to="/chat" state={{ startChatWith: app.profiles }} className="p-2 text-textMuted hover:text-textMain hover:bg-white/5 rounded-lg transition-colors"><MessageCircle size={20} /></Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'applied' && (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {appliedProjects.length === 0 ? (
                 <div className="text-center py-20 text-textMuted border border-dashed border-border rounded-3xl">You haven't applied to any projects yet.</div>
              ) : (
                appliedProjects.map(app => (
                  <div key={app.id} className="group bg-surface border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 shadow-lg relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${app.status === 'accepted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-red-500' : app.status === 'closed' ? 'bg-gray-500' : 'bg-yellow-500'}`} />
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 pl-2">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-textMain group-hover:text-primary transition-colors">{app.projects?.title || 'Project Removed'}</h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-textMuted mb-4">
                          <span className="bg-white/5 px-2.5 py-0.5 rounded-md text-textMuted border border-white/5">
                            {app.projects?.categories?.name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary"/> Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="relative pl-4 border-l-2 border-border">
                          <p className="text-sm text-textMuted italic">"{app.message}"</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 min-w-[140px]">
                        {app.projects && (
                            <Link to={`/projects/${app.project_id}`} state={{ from: '/my-projects' }} className="w-full py-2 px-4 rounded-xl border border-border text-textMain text-sm font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                              <Eye size={16} /> View Project
                            </Link>
                        )}
                        {app.status === 'pending' && (
                          <button onClick={() => handleWithdrawApplication(app.id)} className="w-full py-2 px-4 rounded-xl text-textMuted text-sm font-medium hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} /> Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyProjects;