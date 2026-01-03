import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info } from 'lucide-react'; // MessageSquare usunięte z importów, bo tu nie używamy
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { APPLICATION_STATUS_STYLES } from '../../utils/constants';

const NotificationsMenu = ({ notifications = [], unreadCount = 0, markAsRead, markAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString) => {
    try { return format(new Date(dateString), 'MMM d, HH:mm'); } 
    catch (e) { return ''; }
  };

  const renderNotificationContent = (n) => {
    // Obsługujemy tylko statusy i ogólne (bez czatu)
    if (n.type === 'application_status_change') {
      const { projectTitle, newStatus } = n.data || {};
      const statusStyle = APPLICATION_STATUS_STYLES[newStatus] || 'text-gray-400';
      
      return (
        <span>
          Update for <span className="font-semibold text-textMain">{projectTitle || 'project'}</span>: {' '}
          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${statusStyle}`}>
            {newStatus}
          </span>
        </span>
      );
    }
    return <span className="text-textMuted">{n.message || 'New notification'}</span>;
  };

  const getIcon = (type) => {
    if (type === 'application_status_change') return <Info size={16} className="text-purple-400" />;
    return <Bell size={16} className="text-gray-400" />;
  };

  const handleNotificationClick = async (n) => {
    if (!n.is_read) markAsRead(n.id);
    setIsOpen(false);
    
    if (n.data?.link) { navigate(n.data.link); return; }
    
    // Prosta nawigacja dla reszty
    if (n.type === 'application_status_change') navigate('/my-projects');
  };

  // FILTROWANIE: Ukrywamy wiadomości czatu z listy dzwoneczka!
  const visibleNotifications = notifications.filter(n => n.type !== 'new_message');

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 h-10 w-10 rounded-lg text-textMuted hover:text-textMain hover:bg-white/5 transition-all relative flex items-center justify-center group"
      >
        <Bell size={20} className="group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-sm">
            <h3 className="font-bold text-textMain text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-primary/10"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {visibleNotifications.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm flex flex-col items-center gap-2">
                <Bell className="opacity-20" size={32} />
                No system notifications
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {visibleNotifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group flex gap-3 items-start relative
                      ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="mt-1 shrink-0">
                       {!n.is_read ? (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                       ) : (
                          getIcon(n.type)
                       )}
                    </div>
                    <div className="flex-grow">
                      <div className={`text-sm leading-relaxed ${!n.is_read ? 'text-textMain font-medium' : 'text-textMuted'}`}>
                        {renderNotificationContent(n)}
                      </div>
                      <p className="text-[10px] text-textMuted mt-1.5 font-medium">
                        {formatTime(n.created_at)}
                      </p>
                    </div>
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