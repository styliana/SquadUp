import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import UserAvatar from '../common/UserAvatar'; // Importujemy nasz główny komponent

const ChatSidebar = ({ users, selectedUser, onSelectUser, unreadMap, loading, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  return (
    <div className={`w-full md:w-80 border-r border-border flex flex-col bg-surface/50 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
      {/* HEADER */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-textMain mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* LISTA UŻYTKOWNIKÓW */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-textMuted text-center text-sm">Loading contacts...</div>
        ) : users.length === 0 ? (
           <div className="p-8 text-textMuted text-center text-sm flex flex-col items-center">
             <Search size={24} className="mb-2 opacity-50" />
             <p>No contacts found.</p>
             <p className="text-xs mt-1">Search to start a new chat.</p>
           </div>
        ) : (
          users.map((u) => {
            const hasUnread = unreadMap[u.id] > 0;
            return (
              <div 
                key={u.id}
                onClick={() => onSelectUser(u)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-white/5 ${
                  selectedUser?.id === u.id 
                    ? 'bg-primary/10 border-l-4 border-l-primary' 
                    : hasUnread 
                        ? 'bg-white/5 border-l-4 border-l-red-500' 
                        : 'hover:bg-white/5 border-l-4 border-l-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <UserAvatar 
                    avatarUrl={u.avatar_url} 
                    name={u.full_name || u.email} 
                    className="w-10 h-10" 
                  />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-surface animate-pulse"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${hasUnread ? 'text-textMain font-bold' : 'text-textMuted'}`}>
                    {u.full_name || u.email}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${hasUnread ? 'text-textMain' : 'text-textMuted'}`}>
                      {hasUnread ? `${unreadMap[u.id]} new messages` : (u.university || 'Student')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;