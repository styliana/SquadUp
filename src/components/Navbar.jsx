import { Link, useLocation } from 'react-router-dom';
import { Megaphone, PlusCircle, MessageSquare, User, Users } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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

          {/* NAVIGATION LINKS */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/projects" icon={<Megaphone size={18} />} text="Find Projects" active={isActive('/projects')} />
            <NavLink to="/create-project" icon={<PlusCircle size={18} />} text="Create Project" active={isActive('/create-project')} />
            <NavLink to="/chat" icon={<MessageSquare size={18} />} text="Chat" active={isActive('/chat')} />
            <NavLink to="/profile" icon={<User size={18} />} text="Profile" active={isActive('/profile')} />
          </div>

          {/* AUTH BUTTONS */}
          <div>
            <button className="bg-gradient-to-r from-primary to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              Sign In
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

// Helper Component for Links
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