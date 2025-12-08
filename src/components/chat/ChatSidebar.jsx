import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce'; // Upewnij się co do ścieżki

const ChatSidebar = ({ users, selectedUser, onSelectUser, unreadMap, loading, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce: czekamy 500ms po zakończeniu pisania zanim wywołamy API
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reagujemy na zmianę debouncedSearchTerm -> wywołujemy onSearch (z hooka useChat)
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  return (
    <div className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-surface/50 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

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
                  <UserAvatar u={u} hasUnread={hasUnread} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${hasUnread ? 'text-white font-bold' : 'text-gray-300'}`}>
                    {u.full_name || u.email}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${hasUnread ? 'text-white' : 'text-textMuted'}`}>
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

// Mały pomocnik do Avatara, żeby kod był czystszy
const UserAvatar = ({ u, hasUnread }) => (
  <>
    {u.avatar_url ? (
      <img src={u.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="User" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold uppercase">
        {u.email ? u.email.charAt(0) : '?'}
      </div>
    )}
    {hasUnread && (
      <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-surface"></span>
    )}
  </>
);

export default ChatSidebar;