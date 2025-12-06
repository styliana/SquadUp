import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Megaphone, PlusCircle, MessageSquare, User, Users, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import UserAvatar from './UserAvatar';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        if (data) setAvatarUrl(data.avatar_url);
      };
      getProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300">
               <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Squad Up
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/projects" icon={<Megaphone size={18} />} text="Find Projects" active={isActive('/projects')} />
            {user && (
              <>
                <NavLink to="/create-project" icon={<PlusCircle size={18} />} text="Create Project" active={isActive('/create-project')} />
                <NavLink to="/my-projects" icon={<Briefcase size={18} />} text="My Projects" active={isActive('/my-projects')} />
                <NavLink to="/chat" icon={<MessageSquare size={18} />} text="Chat" active={isActive('/chat')} />
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 group">
                  {/* UŻYCIE KOMPONENTU AVATAR - czysto i elegancko */}
                  <UserAvatar 
                    avatarUrl={avatarUrl} 
                    name={user.email} 
                    className="w-9 h-9" 
                    textSize="text-sm" 
                  />
                  <span className="hidden sm:block text-sm font-medium text-white group-hover:text-primary transition-colors">
                    Profile
                  </span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-textMuted hover:text-red-400 transition-colors" title="Log out"><LogOut size={20} /></button>
              </>
            ) : (
              <Link to="/login"><button className="bg-gradient-to-r from-primary to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-2 px-5 rounded-lg transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]">Sign In</button></Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, text, active }) => (
  <Link to={to} className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>
    {icon} <span>{text}</span>
  </Link>
);

export default Navbar;