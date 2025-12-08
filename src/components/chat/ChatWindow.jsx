import { useState, useRef, useEffect } from 'react';
import { Send, MoreHorizontal } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ selectedUser, messages, currentUser, onSendMessage, onTyping, isTyping, onBack }) => {
  const [newMessage, setNewMessage] = useState("");
  
  // ZMIANA: Ref do kontenera (diva z paskiem przewijania), a nie do "końca wiadomości"
  const chatContainerRef = useRef(null);

  // ZMIANA: Scrollujemy tylko wewnętrzny kontener
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      
      // Jeśli treści jest więcej niż miejsca, przewiń na dół
      if (scrollHeight > clientHeight) {
        chatContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth' // Płynne przewijanie
        });
      }
    }
  }, [messages, isTyping]); // Uruchom, gdy przyjdą wiadomości lub ktoś pisze

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (onTyping) onTyping();
  };

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-textMuted bg-background">
        <MoreHorizontal size={48} opacity={0.2} />
        <p className="text-lg mt-4">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* HEADER */}
      <div className="h-16 border-b border-white/10 flex items-center gap-3 px-6 bg-surface/30 shrink-0">
        <button onClick={onBack} className="md:hidden text-textMuted mr-2">←</button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold uppercase overflow-hidden">
          {selectedUser.avatar_url ? (
             <img src={selectedUser.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
             selectedUser.email ? selectedUser.email.charAt(0) : '?'
          )}
        </div>
        <div>
          <h3 className="font-bold text-white">{selectedUser.full_name || selectedUser.email}</h3>
          <p className="text-xs text-primary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Online
          </p>
        </div>
      </div>

      {/* LISTA WIADOMOŚCI */}
      {/* Tutaj przypisujemy ref do kontenera, który ma overflow-y-auto */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isMe={msg.sender_id === currentUser.id} 
          />
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface border border-white/10 rounded-2xl p-4 rounded-bl-none flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* FORMULARZ */}
      <div className="p-4 border-t border-white/10 bg-surface/30 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input 
            type="text" 
            value={newMessage}
            onChange={handleChange} 
            placeholder="Type a message..." 
            className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
          <button disabled={!newMessage.trim()} className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;