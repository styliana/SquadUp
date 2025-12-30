import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, MessageSquare, Info } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { APPLICATION_STATUS_STYLES } from '../../utils/constants';

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

    // SUBSKRYPCJA REAL-TIME
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Generujemy tekst do Toasta (bo w bazie może nie być pola message)
          const toastText = getToastText(newNotif);
          toast.info(toastText);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Pomocnicza funkcja do tekstu w Toast
  const getToastText = (n) => {
    if (n.type === 'application_status_change') {
      return `Update for ${n.data?.projectTitle || 'project'}: ${n.data?.newStatus}`;
    }
    if (n.type === 'new_message') {
      return `New message from ${n.data?.senderName || 'someone'}`;
    }
    return n.message || 'New notification';
  };

  // 2. Renderowanie treści w zależności od TYPU (JSONB logic)
  const renderNotificationContent = (n) => {
    // Przypadek A: Zmiana statusu aplikacji
    if (n.type === 'application_status_change') {
      const { projectTitle, newStatus } = n.data || {};
      // Pobieramy styl z constants.js
      const statusStyle = APPLICATION_STATUS_STYLES[newStatus] || 'text-gray-400';
      
      return (
        <span>
          Application for <span className="font-semibold text-textMain">{projectTitle}</span> is{' '}
          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${statusStyle}`}>
            {newStatus}
          </span>
        </span>
      );
    }

    // Przypadek B: Nowa wiadomość
    if (n.type === 'new_message') {
      const { senderName, content } = n.data || {};
      return (
        <span>
          <span className="font-semibold text-textMain">{senderName}</span> sent a message: "{content}"
        </span>
      );
    }

    // Przypadek C: Fallback dla starych powiadomień lub systemowych
    return <span className="text-textMuted">{n.message || JSON.stringify(n.data)}</span>;
  };

  // 3. Ikona w zależności od typu
  const getIcon = (type) => {
    if (type === 'new_message') return <MessageSquare size={16} className="text-blue-400" />;
    if (type === 'application_status_change') return <Info size={16} className="text-purple-400" />;
    return <Bell size={16} className="text-gray-400" />;
  };

  // 4. Obsługa kliknięcia (Nawigacja)
  const handleNotificationClick = async (n) => {
    if (!n.is_read) await markAsRead(n.id);
    setIsOpen(false);
    
    // Jeśli mamy link w JSON
    if (n.data?.link) {
        navigate(n.data.link);
        return;
    }
    // Jeśli mamy link w kolumnie (stare)
    if (n.related_link) {
        navigate(n.related_link);
        return;
    }

    // Inteligentna nawigacja po typie
    switch (n.type) {
      case 'new_message':
        navigate('/chat'); 
        break;
      case 'application_status_change':
        navigate('/my-projects'); // Tam sprawdzamy statusy
        break;
      case 'project_invite':
        navigate('/projects');
        break;
      default:
        // Zostań na stronie lub idź do dashboardu
        break;
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
        className="p-2 h-10 w-10 rounded-lg text-textMuted hover:text-textMain hover:bg-white/5 transition-all relative flex items-center justify-center"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-sm">
            <h3 className="font-bold text-textMain text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm flex flex-col items-center gap-2">
                <Bell className="opacity-20" size={32} />
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group flex gap-3 items-start relative
                      ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    {/* Status Dot / Icon */}
                    <div className="mt-1 shrink-0">
                       {!n.is_read ? (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                       ) : (
                          getIcon(n.type)
                       )}
                    </div>

                    <div className="flex-grow pr-6">
                      <div className={`text-sm leading-relaxed ${!n.is_read ? 'text-textMain' : 'text-textMuted'}`}>
                        {renderNotificationContent(n)}
                      </div>
                      <p className="text-[10px] text-textMuted mt-1.5 font-medium">
                        {formatTime(n.created_at)}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button 
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                      title="Remove"
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