import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Megaphone, PlusCircle, MessageSquare, Users, LogOut, Briefcase, Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import UserAvatar from '../common/UserAvatar';
import NotificationsMenu from '../common/NotificationsMenu'; 
import { useTheme } from '../../hooks/useTheme';
import Button from '../ui/Button';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- STATE ---
  const [notifications, setNotifications] = useState([]);
  const [unreadBellCount, setUnreadBellCount] = useState(0); // Tylko Dzwonek
  const [unreadChatCount, setUnreadChatCount] = useState(0); // Tylko Czat

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Pobieranie avatara
  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
        if (data) setAvatarUrl(data.avatar_url);
      };
      getProfile();
    }
  }, [user]);

  // --- LOGIKA POWIADOMIEŃ I CZATU ---
  useEffect(() => {
    if (!user) return;

    // Funkcja segregująca liczniki
    const updateCounts = (list) => {
      setNotifications(list);
      
      // 1. Licznik dla CZATU (tylko type 'new_message')
      const chatUnread = list.filter(n => !n.is_read && n.type === 'new_message').length;
      setUnreadChatCount(chatUnread);

      // 2. Licznik dla DZWONKA (wszystko OPRÓCZ 'new_message')
      const bellUnread = list.filter(n => !n.is_read && n.type !== 'new_message').length;
      setUnreadBellCount(bellUnread);
    };

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Pobieramy więcej, żeby mieć historię
      
      if (data) updateCounts(data);
    };

    fetchNotifications();

    const channel = supabase
      .channel('navbar_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => {
            const newList = [payload.new, ...prev];
            updateCounts(newList);
            return newList;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // --- HANDLERS ---

  // A. Kliknięcie w CZAT (czyści kropkę czatu)
  const handleChatClick = async () => {
    const chatNotificationIds = notifications
      .filter(n => !n.is_read && n.type === 'new_message')
      .map(n => n.id);

    if (chatNotificationIds.length > 0) {
      // Optymistyczny update UI
      const updatedList = notifications.map(n => 
        chatNotificationIds.includes(n.id) ? { ...n, is_read: true } : n
      );
      // Ręczna aktualizacja liczników
      setNotifications(updatedList);
      setUnreadChatCount(0); 
      // Dzwonek bez zmian, bo czat go nie dotyczy

      // Update w bazie
      await supabase.from('notifications').update({ is_read: true }).in('id', chatNotificationIds);
    }
  };

  // B. Kliknięcie w POWIADOMIENIE z listy (przekazywane do dziecka)
  const markAsRead = async (id) => {
    const updatedList = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    setNotifications(updatedList);
    setUnreadBellCount(updatedList.filter(n => !n.is_read && n.type !== 'new_message').length);
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };
  
  // C. Kliknięcie "Mark all read" w dzwonku (tylko te widoczne w dzwonku!)
  const markAllBellAsRead = async () => {
    // Szukamy ID tylko tych, które nie są wiadomościami
    const bellUnreadIds = notifications
      .filter(n => !n.is_read && n.type !== 'new_message')
      .map(n => n.id);

    if (bellUnreadIds.length > 0) {
        const updatedList = notifications.map(n => 
            bellUnreadIds.includes(n.id) ? { ...n, is_read: true } : n
        );
        setNotifications(updatedList);
        setUnreadBellCount(0);
        await supabase.from('notifications').update({ is_read: true }).in('id', bellUnreadIds);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Całkowita liczba powiadomień dla Burgera (Czat + Dzwonek)
  const totalUnreadForBurger = unreadChatCount + unreadBellCount;

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300">
                 <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                Squad Up
              </span>
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/projects" icon={<Megaphone size={18} />} text="Find Projects" active={isActive('/projects')} />
            
            {user && (
              <>
                <NavLink to="/create-project" icon={<PlusCircle size={18} />} text="Create Project" active={isActive('/create-project')} />
                <NavLink to="/my-projects" icon={<Briefcase size={18} />} text="My Projects" active={isActive('/my-projects')} />
                
                {/* CHAT LINK Z OBSŁUGĄ KLIKNIĘCIA */}
                <Link 
                  to="/chat" 
                  onClick={handleChatClick}
                  className={`relative flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                    isActive('/chat') ? 'text-primary' : 'text-textMuted hover:text-textMain'
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

                {isAdmin && (
                   <NavLink to="/admin" icon={<Shield size={18} />} text="Admin" active={isActive('/admin')} />
                )}
              </>
            )}
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={toggleTheme} className="p-2 h-10 w-10 rounded-lg">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {user ? (
              <>
                {/* Przekazujemy przefiltrowany unreadBellCount! */}
                <NotificationsMenu 
                  notifications={notifications} 
                  unreadCount={unreadBellCount} 
                  markAsRead={markAsRead}
                  markAllAsRead={markAllBellAsRead}
                />

                <Link to="/profile" className="hidden md:flex items-center gap-2 group ml-2">
                  <UserAvatar avatarUrl={avatarUrl} name={user.email} className="w-9 h-9" textSize="text-sm" />
                </Link>
                
                <Button variant="ghost" onClick={handleLogout} className="hidden md:flex p-2 h-10 w-10 text-textMuted hover:text-red-400">
                  <LogOut size={20} />
                </Button>

                {/* BURGER MENU BUTTON */}
                <Button 
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 h-10 w-10 relative"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  
                  {/* Burger świeci się, jeśli jest cokolwiek nowego (Chat LUB Dzwonek) */}
                  {!isMobileMenuOpen && totalUnreadForBurger > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button className="py-2 px-5 text-sm">Sign In</Button></Link>
                <Button variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 h-10 w-10">
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-2">
              <MobileNavLink to="/projects" icon={<Megaphone size={18} />} text="Find Projects" active={isActive('/projects')} />
              
              {user && (
                <>
                  <MobileNavLink to="/create-project" icon={<PlusCircle size={18} />} text="Create Project" active={isActive('/create-project')} />
                  <MobileNavLink to="/my-projects" icon={<Briefcase size={18} />} text="My Projects" active={isActive('/my-projects')} />
                  
                  {/* CHAT MOBILE */}
                  <Link 
                    to="/chat" 
                    onClick={() => {
                        handleChatClick();
                        setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive('/chat') ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-textMain/5'
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

                  {isAdmin && (
                    <MobileNavLink to="/admin" icon={<Shield size={18} />} text="Admin Panel" active={isActive('/admin')} />
                  )}
                </>
              )}
            </div>

            {user && (
              <div className="pt-4 border-t border-border">
                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-textMain/5 transition-colors mb-2">
                  <UserAvatar avatarUrl={avatarUrl} name={user.email} className="w-8 h-8" />
                  <div>
                    <p className="text-sm font-bold text-textMain">My Profile</p>
                    <p className="text-xs text-textMuted truncate max-w-[200px]">{user.email}</p>
                  </div>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, icon, text, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
      active ? 'text-primary' : 'text-textMuted hover:text-textMain'
    }`}
  >
    {icon} <span>{text}</span>
  </Link>
);

const MobileNavLink = ({ to, icon, text, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      active ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-textMain/5'
    }`}
  >
    {icon} <span className="font-medium">{text}</span>
  </Link>
);

export default Navbar;