import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, MessageSquare, Briefcase, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyProjects = () => {
  const { user } = useAuth();
  
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
      // --- 1. POBIERZ MOJE PROJEKTY (PUBLISHED) ---
      const { data: myProjects, error: err1 } = await supabase
        .from('projects')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (err1) throw err1;

      // WAŻNE: Ustawiamy projekty od razu, nawet bez aplikacji (żeby nie było pusto)
      setCreatedProjects(myProjects || []);

      // --- 2. DOCIĄGNIJ ZGŁOSZENIA DO TYCH PROJEKTÓW ---
      if (myProjects && myProjects.length > 0) {
        const projectsWithApps = await Promise.all(myProjects.map(async (project) => {
          // Pobieramy aplikacje i łączymy z tabelą profiles, wskazując klucz applicant_id
          const { data: applications, error: appError } = await supabase
            .from('applications')
            .select('*, profiles!applicant_id(*)') 
            .eq('project_id', project.id);
            
          if (appError) console.error("Błąd pobierania aplikacji:", appError);
          
          return { ...project, applications: applications || [] };
        }));
        setCreatedProjects(projectsWithApps);
      }

      // --- 3. POBIERZ GDZIE JA APLIKOWAŁEM (APPLIED) ---
      const { data: myApplications, error: err2 } = await supabase
        .from('applications')
        .select('*, projects!project_id(*)') // Wskazujemy klucz project_id
        .eq('applicant_id', user.id);

      if (err2) throw err2;
      setAppliedProjects(myApplications || []);

    } catch (error) {
      console.error("Główny błąd pobierania:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Briefcase className="text-primary" /> My Dashboard
      </h1>

      {/* ZAKŁADKI */}
      <div className="flex border-b border-white/10 mb-8">
        <button 
          onClick={() => setActiveTab('published')}
          className={`pb-4 px-6 text-lg font-medium transition-all relative ${
            activeTab === 'published' ? 'text-primary' : 'text-textMuted hover:text-white'
          }`}
        >
          Published Projects ({createdProjects.length})
          {activeTab === 'published' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        
        <button 
          onClick={() => setActiveTab('applied')}
          className={`pb-4 px-6 text-lg font-medium transition-all relative ${
            activeTab === 'applied' ? 'text-primary' : 'text-textMuted hover:text-white'
          }`}
        >
          Applications Sent ({appliedProjects.length})
          {activeTab === 'applied' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* WIDOK: PUBLISHED */}
      {activeTab === 'published' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
          {createdProjects.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-white/10">
              <p className="text-textMuted mb-4">You haven't created any projects yet.</p>
              <Link to="/create-project" className="text-primary hover:underline">Create one now!</Link>
            </div>
          ) : (
            createdProjects.map(project => (
              <div key={project.id} className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">{project.title}</h2>
                    <p className="text-sm text-textMuted mt-1">{project.type} • Posted on {new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/projects/${project.id}`} className="text-sm text-primary hover:underline">View Public Page</Link>
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4">
                    Candidates ({project.applications?.length || 0})
                  </h3>
                  
                  {(!project.applications || project.applications.length === 0) ? (
                    <p className="text-textMuted text-sm italic py-2">No applications yet. Waiting for candidates...</p>
                  ) : (
                    <div className="grid gap-4">
                      {project.applications.map(app => (
                        <div key={app.id} className="bg-background border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
                          
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold uppercase">
                              {app.profiles?.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{app.profiles?.full_name || 'Unknown User'}</div>
                              <div className="text-xs text-textMuted">{app.profiles?.university || 'Student'}</div>
                            </div>
                          </div>

                          <div className="flex-grow bg-surface/50 rounded-lg p-3 text-sm text-gray-300 relative">
                            <MessageSquare size={14} className="absolute -left-1 top-3 text-surface/50 fill-current" />
                            <span className="text-primary font-bold text-xs block mb-1">Note:</span>
                            <p className="italic">"{app.message || 'No message'}"</p>
                          </div>

                          <div className="flex gap-2 shrink-0 self-center md:self-start">
                            <Link to="/chat" className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2">
                              <MessageCircle size={16} /> Chat
                            </Link>
                            <Link to={`/profile`} className="px-3 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors">
                              <User size={16} />
                            </Link>
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

      {/* WIDOK: APPLIED */}
      {activeTab === 'applied' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          {appliedProjects.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-white/10">
              <p className="text-textMuted mb-4">You haven't applied to any projects.</p>
              <Link to="/projects" className="text-primary hover:underline">Browse Projects</Link>
            </div>
          ) : (
            appliedProjects.map(app => (
              <div key={app.id} className="bg-surface border border-white/5 rounded-xl p-5 flex flex-col md:flex-row gap-6 items-center justify-between hover:border-white/10 transition-colors">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-white mb-1">{app.projects?.title || "Unknown Project"}</h3>
                  <div className="flex gap-3 text-sm text-textMuted mb-2">
                    <span className="bg-white/5 px-2 rounded">{app.projects?.type}</span>
                    <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-400 bg-background/50 p-2 rounded border border-white/5 inline-block">
                    <span className="text-primary text-xs font-bold mr-2">YOUR NOTE:</span>
                    <span className="italic">"{app.message}"</span>
                  </div>
                </div>
                
                <Link to={`/projects/${app.project_id}`} className="px-5 py-2.5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/5 transition-colors whitespace-nowrap">
                  View Project
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyProjects;