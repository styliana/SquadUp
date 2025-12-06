import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, MessageSquare, Briefcase, MessageCircle, User, Check, X, Trash2, Edit2 } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MyProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [createdProjects, setCreatedProjects] = useState([]);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. MOJE PROJEKTY
      const { data: myProjects, error: err1 } = await supabase
        .from('projects')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (err1) throw err1;

      if (myProjects && myProjects.length > 0) {
        const projectsWithApps = await Promise.all(myProjects.map(async (project) => {
          const { data: applications } = await supabase
            .from('applications')
            .select('*, profiles!applicant_id(*)') 
            .eq('project_id', project.id);
          return { ...project, applications: applications || [] };
        }));
        setCreatedProjects(projectsWithApps);
      } else {
        setCreatedProjects([]);
      }

      // 2. MOJE APLIKACJE
      const { data: myApplications, error: err2 } = await supabase
        .from('applications')
        .select('*, projects!project_id(*)')
        .eq('applicant_id', user.id);

      if (err2) throw err2;
      setAppliedProjects(myApplications || []);

    } catch (error) {
      console.error("Błąd:", error);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure? This will delete the project and all applications.")) return;
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

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);
      if (error) throw error;
      setCreatedProjects(prev => prev.map(project => ({
        ...project,
        applications: project.applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      })));
      toast.success(`Application ${newStatus}!`);
    } catch (error) {
      console.error(error);
      toast.error("Action failed.");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Briefcase className="text-primary" /> My Dashboard
      </h1>

      <div className="flex border-b border-white/10 mb-8">
        <button onClick={() => setActiveTab('published')} className={`pb-4 px-6 text-lg font-medium transition-all relative ${activeTab === 'published' ? 'text-primary' : 'text-textMuted hover:text-white'}`}>Published Projects ({createdProjects.length}){activeTab === 'published' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}</button>
        <button onClick={() => setActiveTab('applied')} className={`pb-4 px-6 text-lg font-medium transition-all relative ${activeTab === 'applied' ? 'text-primary' : 'text-textMuted hover:text-white'}`}>Applications Sent ({appliedProjects.length}){activeTab === 'applied' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}</button>
      </div>

      {activeTab === 'published' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
          {createdProjects.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-white/10"><p className="text-textMuted mb-4">You haven't created any projects yet.</p><Link to="/create-project" className="text-primary hover:underline">Create one now!</Link></div>
          ) : (
            createdProjects.map(project => (
              <div key={project.id} className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-start">
                  <div><h2 className="text-xl font-bold text-white">{project.title}</h2><p className="text-sm text-textMuted mt-1">{project.type} • {new Date(project.created_at).toLocaleDateString()}</p></div>
                  <div className="flex items-center gap-2">
                    <Link to={`/projects/${project.id}`} className="px-3 py-1.5 text-sm text-primary hover:underline">View</Link>
                    <button onClick={() => navigate(`/edit-project/${project.id}`)} className="p-2 text-textMuted hover:text-white hover:bg-white/10 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4">Candidates ({project.applications.length})</h3>
                  {project.applications.length === 0 ? <p className="text-textMuted text-sm italic py-2">No applications yet.</p> : (
                    <div className="grid gap-4">
                      {project.applications.map(app => (
                        <div key={app.id} className="bg-background border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                          <div className="flex items-start gap-4 flex-grow">
                            <div className="shrink-0">
                              {app.profiles?.avatar_url ? (
                                <img src={app.profiles.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="User" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold uppercase">
                                  {app.profiles?.full_name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-grow">
                              <div className="font-bold text-white text-sm">{app.profiles?.full_name || 'User'} <span className="ml-2 text-xs font-normal text-textMuted">• {app.profiles?.university}</span></div>
                              <div className="mt-2 bg-surface/50 rounded-lg p-2 text-sm text-gray-300 relative inline-block max-w-xl"><span className="text-primary font-bold text-xs mr-2">Note:</span><span className="italic">"{app.message}"</span></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {app.status === 'pending' ? (
                              <>
                                <button onClick={() => handleStatusChange(app.id, 'accepted')} className="p-2 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20"><Check size={18} /></button>
                                <button onClick={() => handleStatusChange(app.id, 'rejected')} className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"><X size={18} /></button>
                              </>
                            ) : <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${app.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{app.status}</span>}
                            <div className="w-px h-8 bg-white/10 mx-1"></div>
                            <Link to="/chat" className="p-2 text-textMuted hover:text-white"><MessageCircle size={18} /></Link>
                            <Link to={`/profile/${app.profiles?.id}`} className="p-2 text-textMuted hover:text-white"><User size={18} /></Link> {/* <--- KLUCZOWA ZMIANA Z LINKIEM */}
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
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          {appliedProjects.map(app => (
            <div key={app.id} className="bg-surface border border-white/5 rounded-xl p-5 flex flex-col md:flex-row gap-6 items-center justify-between hover:border-white/10 transition-colors">
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-white mb-1">{app.projects?.title}</h3>
                <div className="flex gap-3 text-sm text-textMuted mb-2"><span className="bg-white/5 px-2 rounded">{app.projects?.type}</span><span>Applied: {new Date(app.created_at).toLocaleDateString()}</span></div>
                <div className="text-sm text-gray-400 bg-background/50 p-2 rounded border border-white/5 inline-block"><span className="text-primary text-xs font-bold mr-2">YOUR NOTE:</span><span className="italic">"{app.message}"</span></div>
              </div>
              <Link to={`/projects/${app.project_id}`} className="px-5 py-2.5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/5">View Project</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;