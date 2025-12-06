import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient'; // <--- Importujemy klienta bazy

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      // Pobieramy JEDEN konkretny projekt pasujący do ID z adresu URL
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error("Błąd pobierania projektu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-primary">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-20 text-2xl text-white">Project not found 😢</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* PRZYCISK POWROTU */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-textMuted hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} />
        Back to projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA KOLUMNA - GŁÓWNA TREŚĆ */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-white/5 rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                {project.type}
              </span>
              <div className="flex items-center gap-2 text-textMuted">
                <User size={18} />
                {/* Używamy nazw kolumn z bazy danych (snake_case) */}
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
                  {/* W bazie skills to tablica, więc mapujemy ją tak samo */}
                  {project.skills && project.skills.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-sm text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 pt-6 border-t border-white/5 text-textMuted text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Deadline: {project.deadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {/* Formatujemy datę utworzenia */}
                  <span>Posted: {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA - SIDEBAR */}
        <div className="space-y-6">
          
          {/* KARTA LIDERA */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Team Leader</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-white">
                {/* Pierwsza litera autora */}
                {project.author ? project.author.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className="font-bold text-white">{project.author}</div>
                <div className="text-sm text-textMuted">{project.role}</div>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              Send Message
            </button>
          </div>

          {/* KARTA APLIKOWANIA */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              {project.members_max - project.members_current} Open Spots
            </h3>
            <p className="text-textMuted text-sm mb-6">
              Apply now to join this project. The team leader will review your application.
            </p>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2">
              <Send size={18} />
              Apply for Project
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;