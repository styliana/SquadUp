import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

const NotificationsMenu = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Zamknij menu gdy klikniemy poza nie
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Pobieranie powiadomień
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) console.error('Error fetching notifications:', error);
      else {
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.info("New notification: " + payload.new.message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 2. Obsługa kliknięcia (POPRAWIONA LOGIKA)
  const handleNotificationClick = (n) => {
    // Najpierw oznacz jako przeczytane
    if (!n.is_read) markAsRead(n.id);
    setIsOpen(false);
    
    // Logika przekierowań
    // 1. Jeśli w bazie jest wprost podany link - użyj go
    if (n.related_link) {
        navigate(n.related_link);
        return;
    }

    // 2. Jeśli nie ma linku, zgadujemy na podstawie typu
    // Sprawdź jakie masz "type" w bazie danych, tutaj dałem uniwersalne
    const type = n.type || ''; 

    if (type.includes('message') || type.includes('chat')) {
        navigate('/chat');
    } else if (type.includes('project') && type.includes('new')) {
        // Np. nowy projekt -> lista projektów
        navigate('/projects');
    } else {
        // Domyślnie (aplikacje, statusy, systemowe) -> Dashboard
        navigate('/my-projects');
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));

    await supabase.from('notifications').delete().eq('id', id);
  };

  const formatTime = (dateString) => {
    try {
        return format(new Date(dateString), 'MMM d, HH:mm');
    } catch (e) { return ''; }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 h-10 w-10 rounded-lg text-textMuted hover:text-textMain hover:bg-white/5 transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
            <h3 className="font-bold text-textMain text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm">
                <Bell className="mx-auto mb-2 opacity-20" size={32} />
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group flex gap-3 ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-grow">
                      <p className={`text-sm ${!n.is_read ? 'text-textMain font-medium' : 'text-textMuted'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-textMuted mt-1">
                        {formatTime(n.created_at)}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded transition-all h-fit self-start"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;