import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Megaphone, PlusCircle, MessageSquare, Users, LogOut, Briefcase, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import UserAvatar from './UserAvatar';
import NotificationsMenu from './NotificationsMenu'; 

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  
  // NOWE: Stan menu mobilnego
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Zamknij menu mobilne przy zmianie strony
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
          
          {/* LEWA STRONA: LOGO */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group" aria-label="Go to Home Page">
              <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300">
                 <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                Squad Up
              </span>
            </Link>
          </div>

          {/* ŚRODEK: DESKTOP MENU (Ukryte na mobile) */}
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

          {/* PRAWA STRONA: USER ACTIONS (Desktop & Mobile - widoczne zawsze, ale w uproszczeniu na mobile) */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationsMenu user={user} />

                {/* Desktop Profile Link */}
                <Link to="/profile" className="hidden md:flex items-center gap-2 group ml-2" aria-label="Go to Profile Settings">
                  <UserAvatar 
                    avatarUrl={avatarUrl} 
                    name={user.email} 
                    className="w-9 h-9" 
                    textSize="text-sm" 
                  />
                </Link>
                
                {/* Desktop Logout */}
                <button 
                  onClick={handleLogout}
                  className="hidden md:block p-2 text-textMuted hover:text-red-400 transition-colors"
                  title="Log out"
                >
                  <LogOut size={20} />
                </button>

                {/* MOBILE HAMBURGER BUTTON */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="bg-gradient-to-r from-primary to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    Sign In
                  </button>
                </Link>
                {/* Mobile Menu Button for Guest (if we had links for guests) */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-300 hover:text-white ml-1"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-surface animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-4">
            
            {/* Linki nawigacyjne */}
            <div className="space-y-2">
              <MobileNavLink to="/projects" icon={<Megaphone size={18} />} text="Find Projects" active={isActive('/projects')} />
              
              {user && (
                <>
                  <MobileNavLink to="/create-project" icon={<PlusCircle size={18} />} text="Create Project" active={isActive('/create-project')} />
                  <MobileNavLink to="/my-projects" icon={<Briefcase size={18} />} text="My Projects" active={isActive('/my-projects')} />
                  
                  <Link 
                    to="/chat" 
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive('/chat') ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="relative">
                      <MessageSquare size={18} />
                      {unreadChatCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {unreadChatCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">Chat</span>
                  </Link>
                </>
              )}
            </div>

            {/* Sekcja profilu na mobile */}
            {user && (
              <div className="pt-4 border-t border-white/10">
                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors mb-2">
                  <UserAvatar avatarUrl={avatarUrl} name={user.email} className="w-8 h-8" />
                  <div>
                    <p className="text-sm font-bold text-white">My Profile</p>
                    <p className="text-xs text-textMuted truncate max-w-[200px]">{user.email}</p>
                  </div>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Pomocniczy komponent dla linków desktopowych
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

// Pomocniczy komponent dla linków mobilnych
const MobileNavLink = ({ to, icon, text, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      active ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="font-medium">{text}</span>
  </Link>
);

export default Navbar;