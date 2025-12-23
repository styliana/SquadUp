import { useState, useRef, useEffect } from 'react';
import { Send, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import MessageBubble from './MessageBubble';
import UserAvatar from '../common/UserAvatar';
import Button from '../ui/Button';

const ChatWindow = ({ selectedUser, messages, currentUser, onSendMessage, onTyping, isTyping, onBack }) => {
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);
  const navigate = useNavigate(); // 2. Inicjalizacja hooka

  // Auto-scroll na dół
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      if (scrollHeight > clientHeight) {
        chatContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isTyping]);

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

  const handleProfileClick = () => {
    if (selectedUser?.id) {
      navigate(`/profile/${selectedUser.id}`);
    }
  };

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-textMuted bg-background">
        <div className="p-6 bg-surface border border-white/5 rounded-full mb-4">
            <MoreHorizontal size={48} opacity={0.3} />
        </div>
        <p className="text-lg font-medium">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* HEADER */}
      <div className="h-16 border-b border-border flex items-center gap-3 px-4 md:px-6 bg-surface/30 shrink-0 backdrop-blur-sm">
        <div className="md:hidden">
            <Button variant="ghost" onClick={onBack} className="p-2 h-auto rounded-lg">
                <ArrowLeft size={20} />
            </Button>
        </div>
        
        {/* 3. Owinęliśmy Avatar i Dane w klikalny div */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1"
          onClick={handleProfileClick}
          title="View Profile"
        >
          <UserAvatar 
              avatarUrl={selectedUser.avatar_url} 
              name={selectedUser.full_name || selectedUser.email} 
              className="w-10 h-10" 
          />
          
          <div>
            <h3 className="font-bold text-textMain text-sm md:text-base hover:underline decoration-primary decoration-2 underline-offset-4">
              {selectedUser.full_name || selectedUser.email}
            </h3>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
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
            <div className="bg-surface border border-border rounded-2xl p-4 rounded-bl-none flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT FORM */}
      <div className="p-4 border-t border-border bg-surface/30 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input 
            type="text" 
            value={newMessage}
            onChange={handleChange} 
            placeholder="Type a message..." 
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim()} 
            className="w-12 h-12 p-0 rounded-xl"
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;