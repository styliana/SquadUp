import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useProjectDetails } from '../hooks/useProjectDetails';

// Importujemy nasze wydzielone komponenty
import ProjectInfo from '../components/project-details/ProjectInfo';
import ProjectSidebar from '../components/project-details/ProjectSidebar';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Używamy naszego naprawionego hooka
  const { project, loading } = useProjectDetails(id);

  const [hasApplied, setHasApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [userSkills, setUserSkills] = useState([]);

  const backPath = location.state?.from || '/projects';
  const backLabel = backPath === '/my-projects' ? 'Back to My Projects' : 'Back to projects';

  // 1. Sprawdzenie czy użytkownik już aplikował
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

  // 2. Pobieranie umiejętności usera (do podświetlania skilli w ProjectInfo)
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

  // 3. Logika Aplikowania
  const handleApply = async (message) => {
    if (!user) {
      toast.error("You must be logged in to apply.");
      navigate('/login');
      return;
    }
    if (!message || !message.trim()) {
      toast.warning("Please write a short message.");
      return;
    }

    setApplyLoading(true);
    const { error } = await supabase
      .from('applications')
      .insert([{ 
          project_id: id, 
          applicant_id: user.id,
          message: message 
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

  // 4. Logika wysyłania wiadomości
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!project) return <div className="text-center py-20 text-textMain">Project not found 😢</div>;

  const isAuthor = user && project.author_id === user.id;
  const author = project.profiles; 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to={backPath} className="inline-flex items-center gap-2 text-textMuted hover:text-textMain mb-8 transition-colors">
        <ArrowLeft size={20} />
        {backLabel}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA KOLUMNA: Info (Tytuł, Kategoria, Opis, Skille) */}
        <div className="lg:col-span-2">
          <ProjectInfo 
            project={project} 
            userSkills={userSkills} 
          />
        </div>

        {/* PRAWA KOLUMNA: Sidebar (Lider, Zespół, Aplikowanie) */}
        <div>
          <ProjectSidebar 
            project={project}
            author={author}
            user={user}
            isAuthor={isAuthor}
            hasApplied={hasApplied}
            onApply={handleApply}
            onSendMessage={handleSendMessage}
            applyLoading={applyLoading}
          />
        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;