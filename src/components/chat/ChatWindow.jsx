import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Send, MoreHorizontal, ArrowLeft, Loader2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import UserAvatar from '../common/UserAvatar';
import Button from '../ui/Button';

const ChatWindow = ({ 
  selectedUser, 
  messages, 
  currentUser, 
  onSendMessage, 
  onTyping, 
  isTyping, 
  onBack,
  onLoadMore, 
  hasMore 
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatContainerRef = useRef(null);
  const scrollOffsetRef = useRef(0); // Ref do zapamiętania dystansu od dołu
  const navigate = useNavigate();

  // Funkcja obsługująca ładowanie starszych wiadomości
  const handleLoadMore = async () => {
    if (isLoadingMore || !onLoadMore) return;
    
    const container = chatContainerRef.current;
    if (container) {
      // Zapamiętujemy dystans od DOŁU kontenera, a nie od góry
      scrollOffsetRef.current = container.scrollHeight - container.scrollTop;
    }
    
    setIsLoadingMore(true);
    
    try {
      await onLoadMore();
      // Flaga isLoadingMore zostanie wyłączona w useEffect po zmianie wiadomości
    } catch (error) {
      console.error(error);
      setIsLoadingMore(false);
    }
  };

  // Synchronizacja scrolla po załadowaniu danych (używamy useLayoutEffect dla braku migotania)
  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (container && isLoadingMore) {
      // Przywracamy pozycję: nowa wysokość minus zapamiętany dystans od dołu
      container.scrollTop = container.scrollHeight - scrollOffsetRef.current;
      setIsLoadingMore(false);
    }
  }, [messages]);

  // Auto-scroll na dół TYLKO dla nowych wiadomości i pisania
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && !isLoadingMore) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-textMuted bg-background">
        <MoreHorizontal size={48} className="opacity-20 mb-4" />
        <p className="text-lg font-medium">Wybierz konwersację, aby zacząć czatować</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative border-l border-white/5">
      {/* HEADER */}
      <div className="h-16 border-b border-border flex items-center gap-3 px-4 md:px-6 bg-surface/80 shrink-0 backdrop-blur-md z-20">
        <div className="md:hidden">
            <Button variant="ghost" onClick={onBack} className="p-2 h-auto rounded-lg">
                <ArrowLeft size={20} />
            </Button>
        </div>
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate(`/profile/${selectedUser.id}`)}>
          <UserAvatar avatarUrl={selectedUser.avatar_url} name={selectedUser.full_name || selectedUser.email} className="w-10 h-10" />
          <div>
            <h3 className="font-bold text-textMain text-sm md:text-base">{selectedUser.full_name || selectedUser.email}</h3>
            <p className="text-xs text-primary flex items-center gap-1">Online</p>
          </div>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col space-y-4"
      >
        {hasMore && (
          <div className="flex justify-center py-4 shrink-0">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-6 py-2 bg-primary/20 border border-primary/30 rounded-full text-sm font-bold text-primary hover:bg-primary/30 transition-all disabled:opacity-50"
            >
              {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : <History size={16} />}
              Zobacz starsze wiadomości
            </button>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isMe={msg.sender_id === currentUser.id} 
            />
          ))}
        </div>
        
        {isTyping && (
          <div className="mt-2 flex justify-start">
            <div className="bg-surface border border-border rounded-2xl p-3 flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT FORM */}
      <div className="p-4 border-t border-border bg-surface/30 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input 
            type="text" 
            maxLength={2000}
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); if(onTyping) onTyping(); }} 
            placeholder="Napisz wiadomość..." 
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors"
          />
          <Button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 p-0 rounded-xl shrink-0">
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;