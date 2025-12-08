import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Megaphone, PlusCircle, MessageSquare, User, Users, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import UserAvatar from './UserAvatar';
import NotificationsMenu from './NotificationsMenu'; 

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  // Stan dla chatu (niezależny od powiadomień systemowych)
  const [unreadChatCount, setUnreadChatCount] = useState(0);

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

  // Obsługa nieprzeczytanych wiadomości (CHAT)
  useEffect(() => {
    if (!user) return;

    const fetchUnreadChat = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      setUnreadChatCount(count || 0);
    };
    fetchUnreadChat();

    const channel = supabase
      .channel('unread_messages_nav')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => fetchUnreadChat()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center gap-2 group" aria-label="Go to Home Page">
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
                
                <Link 
                  to="/chat" 
                  className={`relative flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                    isActive('/chat') ? 'text-primary' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <MessageSquare size={18} />
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                      </span>
                    )}
                  </div>
                  <span>Chat</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* NOWE: DZWONEK POWIADOMIEŃ */}
                <NotificationsMenu user={user} />

                <div className="w-px h-6 bg-white/10 mx-1"></div>

                <Link to="/profile" className="flex items-center gap-2 group" aria-label="Go to Profile Settings">
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
                
                <button 
                  onClick={handleLogout}
                  className="p-2 text-textMuted hover:text-red-400 transition-colors"
                  title="Log out"
                  aria-label="Log out" 
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
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

const NavLink = ({ to, icon, text, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
      active ? 'text-primary' : 'text-gray-300 hover:text-white'
    }`}
    aria-label={text} 
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Navbar;