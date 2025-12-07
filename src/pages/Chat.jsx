import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, MoreHorizontal } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  // 1. POBIERZ LISTĘ USERÓW
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id); 

      if (error) console.error(error);
      else setUsers(data || []);
      setLoading(false);
    };

    if (user) fetchUsers();
  }, [user]);

  // OBSŁUGA ROZPOCZĘCIA CZATU Z INNEJ STRONY
  useEffect(() => {
    if (location.state?.startChatWith) {
      setSelectedUser(location.state.startChatWith);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 2. SUBSKRYPCJA I OZNACZANIE JAKO PRZECZYTANE
  useEffect(() => {
    if (!selectedUser) return;

    setMessages([]);
    setIsTyping(false);

    // A. Pobierz wiadomości
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) console.error(error);
      else setMessages(data);

      // B. Oznacz jako przeczytane (Gdy otwieramy czat)
      if (data && data.length > 0) {
        const unreadIds = data
          .filter(m => m.receiver_id === user.id && !m.is_read)
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
    };
    fetchMessages();

    // C. Realtime
    const roomId = [user.id, selectedUser.id].sort().join('_');
    const channel = supabase.channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.sender_id === selectedUser.id) {
            setMessages((prev) => [...prev, payload.new]);
            setIsTyping(false);
            
            // Oznacz nową wiadomość jako przeczytaną od razu, bo jesteśmy w tym czacie
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id);
          }
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender_id === selectedUser.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const msgContent = newMessage;
    setNewMessage("");

    setMessages((prev) => [...prev, {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: msgContent,
      created_at: new Date().toISOString(),
      is_read: false // Własne wiadomości są domyślnie nieprzeczytane przez drugą stronę
    }]);

    const { error } = await supabase.from('messages').insert([{
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: msgContent
    }]);

    if (error) console.error(error);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: user.id }
      });
    }
  };

  // POMOCNICZA FUNKCJA FORMATOWANIA DATY
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    // Format godziny (np. 14:30)
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Jeśli dzisiaj -> tylko godzina
    if (isToday) return time;
    
    // Jeśli inny dzień -> Data + Godzina (np. 12 Oct 14:30)
    return `${date.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto border-x border-white/5">
      
      {/* LEWA KOLUMNA */}
      <div className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-surface/50 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search people..." 
              className="w-full bg-background border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-4 text-textMuted">Loading...</div> : users.map((u) => (
            <div 
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-white/5 ${
                selectedUser?.id === u.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-white/5 border-l-4 border-l-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shrink-0 uppercase">
                {u.email ? u.email.charAt(0) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{u.full_name || u.email}</div>
                <p className="text-xs text-textMuted truncate">{u.university || 'Student'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRAWA KOLUMNA */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col bg-background h-full">
          <div className="h-16 border-b border-white/10 flex items-center gap-3 px-6 bg-surface/30 shrink-0">
            <button onClick={() => setSelectedUser(null)} className="md:hidden text-textMuted mr-2">←</button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold uppercase">
              {selectedUser.email ? selectedUser.email.charAt(0) : '?'}
            </div>
            <div>
              <h3 className="font-bold text-white">{selectedUser.full_name || selectedUser.email}</h3>
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Online
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-4 ${
                    isMe ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-none' : 'bg-surface border border-white/10 text-gray-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* NOWE: Wyświetlanie daty i godziny */}
                    <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                      <span>{formatMessageDate(msg.created_at)}</span>
                      {isMe && (
                         <span>{msg.is_read ? '✓✓' : '✓'}</span> // Opcjonalnie: status przeczytania
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-surface border border-white/10 rounded-2xl p-4 rounded-bl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10 bg-surface/30 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={handleInputChange} 
                placeholder="Type a message..." 
                className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button disabled={!newMessage.trim()} className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl disabled:opacity-50">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-textMuted bg-background">
          <MoreHorizontal size={48} opacity={0.2} />
          <p className="text-lg mt-4">Select a conversation</p>
        </div>
      )}
    </div>
  );
};

export default Chat;