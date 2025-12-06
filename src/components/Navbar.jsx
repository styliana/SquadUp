import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Megaphone, PlusCircle, MessageSquare, User, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <--- Importujemy nasz Context

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300">
               <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Squad Up
            </span>
          </Link>

          {/* LINKI NAWIGACYJNE */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/projects" icon={<Megaphone size={18} />} text="Find Projects" active={isActive('/projects')} />
            
            {/* Pokazuj te linki tylko jak zalogowany */}
            {user && (
              <>
                <NavLink to="/create-project" icon={<PlusCircle size={18} />} text="Create Project" active={isActive('/create-project')} />
                <NavLink to="/chat" icon={<MessageSquare size={18} />} text="Chat" active={isActive('/chat')} />
              </>
            )}
          </div>

          {/* AUTH BUTTONS - ZMIENNE W ZALEŻNOŚCI OD STANU */}
          <div className="flex items-center gap-4">
            {user ? (
              // WIDOK ZALOGOWANEGO UŻYTKOWNIKA
              <>
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center text-white font-bold text-sm border border-white/10 group-hover:border-primary transition-colors">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white group-hover:text-primary transition-colors">
                    Profile
                  </span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="p-2 text-textMuted hover:text-red-400 transition-colors"
                  title="Wyloguj się"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              // WIDOK GOŚCIA (PRZYCISK LOGOWANIA)
              <Link to="/login">
                <button className="bg-gradient-to-r from-primary to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                  Sign In
                </button>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

// Helper Component
const NavLink = ({ to, icon, text, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
      active ? 'text-primary' : 'text-gray-300 hover:text-white'
    }`}
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Navbar;