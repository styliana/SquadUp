import { useState, useEffect, useRef } from 'react';
import { Search, Send, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  
  // Stan
  const [users, setUsers] = useState([]); // Lista dostępnych rozmówców
  const [selectedUser, setSelectedUser] = useState(null); // Aktualnie wybrany rozmówca
  const [messages, setMessages] = useState([]); // Wiadomości w aktywnej rozmowie
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Ref do autoscrollowania
  const messagesEndRef = useRef(null);

  // 1. POBIERZ LISTĘ UŻYTKOWNIKÓW (ROZMÓWCÓW)
  useEffect(() => {
    const fetchUsers = async () => {
      // Pobieramy profile wszystkich OPRÓCZ siebie
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id); 

      if (error) console.error('Błąd pobierania userów:', error);
      else setUsers(data);
      setLoading(false);
    };

    if (user) fetchUsers();
  }, [user]);

  // 2. POBIERZ WIADOMOŚCI GDY WYBIERZEMY ROZMÓWCĘ
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) console.error('Błąd wiadomości:', error);
      else setMessages(data);
    };

    fetchMessages();

    // 3. REALTIME SUBSCRIPTION (Magia!)
    const channel = supabase
      .channel('chat_room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`, // Nasłuchuj wiadomości DO MNIE
        },
        (payload) => {
          // Jeśli wiadomość jest od aktualnego rozmówcy, dodaj ją do listy
          if (payload.new.sender_id === selectedUser.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, user]);

  // Scrollowanie do dołu po nowej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. WYSYŁANIE WIADOMOŚCI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const msgContent = newMessage;
    setNewMessage(""); // Czyść input od razu (UX)

    // Optymistyczne dodanie do UI (żeby było widać od razu)
    const tempMsg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: msgContent,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Wyślij do bazy
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: selectedUser.id,
          content: msgContent
        }
      ]);

    if (error) {
      console.error("Błąd wysyłania:", error);
      // Opcjonalnie: usuń wiadomość z UI lub pokaż błąd
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto border-x border-white/5">
      
      {/* LEWY PANEL - LISTA UŻYTKOWNIKÓW */}
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
          {loading ? (
            <div className="p-4 text-textMuted text-center">Loading users...</div>
          ) : (
            users.map((u) => (
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
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium text-white truncate">
                      {u.full_name || u.email}
                    </span>
                  </div>
                  <p className="text-xs text-textMuted truncate">{u.university || 'Student'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PRAWY PANEL - CZAT */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col bg-background h-full">
          
          {/* HEADER ROZMOWY */}
          <div className="h-16 border-b border-white/10 flex items-center gap-3 px-6 bg-surface/30 shrink-0">
            <button 
              onClick={() => setSelectedUser(null)} // Przycisk powrotu na mobilkach
              className="md:hidden text-textMuted hover:text-white mr-2"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold uppercase">
              {selectedUser.email.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white">{selectedUser.full_name || selectedUser.email}</h3>
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Online
              </p>
            </div>
          </div>

          {/* OKNO WIADOMOŚCI */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-textMuted mt-10">
                Say hello! 👋 This is the start of your conversation.
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-4 ${
                    isMe 
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-none' 
                      : 'bg-surface border border-white/10 text-gray-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-white/10 bg-surface/30 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
          </div>

        </div>
      ) : (
        // EKRAN POWITALNY (gdy nikt nie wybrany)
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-textMuted bg-background">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4">
            <User size={40} opacity={0.5} />
          </div>
          <p className="text-lg">Select a user to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default Chat;