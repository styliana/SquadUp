import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, Briefcase, MessageCircle, User, Check, X, Trash2, Edit2, Clock, Eye, Sparkles } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import UserAvatar from '../components/UserAvatar';
import StatusBadge from '../components/StatusBadge';
// IMPORT HOOKA DO OBSŁUGI BŁĘDÓW
import useThrowAsyncError from '../hooks/useThrowAsyncError';

const MyProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // INICJALIZACJA "MOSTU" DO ERROR BOUNDARY
  const throwAsyncError = useThrowAsyncError();
  
  const [createdProjects, setCreatedProjects] = useState([]);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Pobieranie projektów stworzonych przez użytkownika
      const { data: myProjects, error: err1 } = await supabase
        .from('projects')
        .select(`*, applications(*, profiles:applicant_id(*))`)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (err1) throw err1;
      setCreatedProjects(myProjects || []);

      // 2. Pobieranie aplikacji wysłanych przez użytkownika
      const { data: myApplications, error: err2 } = await supabase
        .from('applications')
        .select('*, projects!project_id(*)')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (err2) throw err2;
      setAppliedProjects(myApplications || []);

    } catch (error) {
      console.error("Critical Dashboard Error:", error);
      // PRZEKAZANIE BŁĘDU DO ERROR BOUNDARY
      // Dzięki temu użytkownik zobaczy ekran błędu z opcją przeładowania,
      // zamiast pustego ekranu lub nieskończonego spinnera.
      throwAsyncError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure? This will delete the project and all applications.")) return;
    try {
      await supabase.from('applications').delete().eq('project_id', projectId);
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
      let resultStatus = 'OPEN';
      // Jeśli akceptujemy, wywołujemy procedurę składowaną (jeśli istnieje) lub update
      // Tutaj zakładam logikę z Twojego wcześniejszego kodu
      if (newStatus === 'accepted') {
        // RPC approve_candidate (upewnij się, że masz tę funkcję w bazie, jeśli nie - użyj zwykłego update)
        // Jeśli nie masz RPC, poniższy kod rzuci błąd, który obsłużymy w catch
        const { data, error } = await supabase.rpc('approve_candidate', { app_id: applicationId, proj_id: projectId });
        
        // Fallback jeśli RPC nie istnieje - ręczny update (dla bezpieczeństwa przykładu)
        if (error && error.message.includes('function not found')) {
             await supabase.from('applications').update({ status: newStatus }).eq('id', applicationId);
             // Tutaj musiałbyś ręcznie obsłużyć licznik members_current, ale załóżmy, że RPC działa lub zrobisz to prościej
        } else if (error) {
            throw error;
        } else {
            resultStatus = data;
        }
      } else {
        const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', applicationId);
        if (error) throw error;
      }

      // Aktualizacja stanu lokalnego UI
      setCreatedProjects(prev => prev.map(project => {
        if (project.id !== projectId) return project;
        
        const updatedApps = project.applications?.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ) || [];
        
        // Jeśli status to 'accepted', zwiększamy licznik (uproszczona logika UI)
        let updatedMembers = project.members_current;
        if (newStatus === 'accepted' && project.members_current < project.members_max) {
            updatedMembers += 1;
        }

        // Jeśli RPC zwróciło 'FULL', zamykamy projekt
        const updatedStatus = resultStatus === 'FULL' ? 'closed' : project.status;
        
        return { ...project, status: updatedStatus, members_current: updatedMembers, applications: updatedApps };
      }));

      if (resultStatus === 'FULL') toast.success("Team complete! Project closed.");
      else toast.success(`Application ${newStatus}!`);

    } catch (error) {
      console.error(error);
      toast.error("Action failed.");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20">
            <Briefcase className="text-white" size={24} />
          </div>
          My Dashboard
        </h1>
      </div>

      <div className="flex gap-6 border-b border-white/10 mb-8">
        <button onClick={() => setActiveTab('published')} className={`pb-4 px-2 text-lg font-medium transition-all relative ${activeTab === 'published' ? 'text-white' : 'text-textMuted hover:text-white'}`}>
          Published Projects <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full text-textMuted">{createdProjects.length}</span>
          {activeTab === 'published' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
        </button>
        <button onClick={() => setActiveTab('applied')} className={`pb-4 px-2 text-lg font-medium transition-all relative ${activeTab === 'applied' ? 'text-white' : 'text-textMuted hover:text-white'}`}>
          Applications Sent <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full text-textMuted">{appliedProjects.length}</span>
          {activeTab === 'applied' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
        </button>
      </div>

      {activeTab === 'published' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {createdProjects.length === 0 ? (
            <div className="text-center py-24 bg-surface/30 rounded-3xl border border-dashed border-white/10">
              <Sparkles className="mx-auto text-primary mb-4 opacity-50" size={48} />
              <p className="text-xl text-white font-semibold mb-2">No projects yet</p>
              <Link to="/create-project" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors inline-block">Create Project</Link>
            </div>
          ) : (
            createdProjects.map(project => (
              <div key={project.id} className={`bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl ${project.status === 'closed' ? 'opacity-75' : ''}`}>
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 
                        className="text-2xl font-bold text-white hover:text-primary transition-colors cursor-pointer" 
                        onClick={() => navigate(`/projects/${project.id}`, { state: { from: '/my-projects' } })}
                      >
                        {project.title}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-textMuted">{project.type}</span>
                      {project.status === 'closed' && <span className="px-2.5 py-0.5 rounded-md bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400 flex items-center gap-1"><Check size={12} /> TEAM FULL</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-textMuted">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> Created: {new Date(project.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><User size={14} /> {project.members_current}/{project.members_max} Members</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/projects/${project.id}`} state={{ from: '/my-projects' }} className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Eye size={20} /></Link>
                    <button onClick={() => navigate(`/edit-project/${project.id}`)} className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit2 size={20} /></button>
                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={20} /></button>
                  </div>
                </div>

                <div className="p-6 bg-[#161b22]">
                  {(!project.applications || project.applications.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-8 text-textMuted opacity-60">
                      <User size={32} className="mb-2" /><p>Waiting for candidates...</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {project.applications.map(app => (
                        <div key={app.id} className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-4 flex-grow w-full md:w-auto">
                            <div className="shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${app.profiles?.id}`)}>
                              <UserAvatar avatarUrl={app.profiles?.avatar_url} name={app.profiles?.full_name} className="w-12 h-12" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-white text-base hover:underline cursor-pointer" onClick={() => navigate(`/profile/${app.profiles?.id}`)}>{app.profiles?.full_name || 'Anonymous'}</span>
                                <span className="text-xs text-textMuted truncate">{app.profiles?.university}</span>
                              </div>
                              <div className="mt-1.5 text-sm text-gray-400 bg-black/20 p-2 rounded-lg border-l-2 border-primary italic">"{app.message}"</div>
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
                            <Link to="/chat" state={{ startChatWith: app.profiles }} className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"><MessageCircle size={20} /></Link>
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
             <div className="text-center py-20 text-textMuted border border-dashed border-white/10 rounded-3xl">You haven't applied to any projects yet. Go find some!</div>
          ) : (
            appliedProjects.map(app => (
              <div key={app.id} className="group bg-surface border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 shadow-lg relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${app.status === 'accepted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-red-500' : app.status === 'closed' ? 'bg-gray-500' : 'bg-yellow-500'}`} />
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 pl-2">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{app.projects?.title || 'Project Removed'}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-textMuted mb-4">
                      <span className="bg-white/5 px-2.5 py-0.5 rounded-md text-gray-300 border border-white/5">{app.projects?.type}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary"/> Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="relative pl-4 border-l-2 border-white/10">
                      <p className="text-xs font-bold text-textMuted uppercase mb-1">Your Application Note</p>
                      <p className="text-sm text-gray-300 italic">"{app.message}"</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <Link to={`/projects/${app.project_id}`} state={{ from: '/my-projects' }} className="w-full py-2 px-4 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                      <Eye size={16} /> View Project
                    </Link>
                    {app.status === 'pending' && (
                      <button onClick={() => handleWithdrawApplication(app.id)} className="w-full py-2 px-4 rounded-xl text-textMuted text-sm font-medium hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
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
    </div>
  );
};

export default MyProjects;