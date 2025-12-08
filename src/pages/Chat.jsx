import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
// Importujemy nasz nowy Hook
import { useChat } from '../hooks/useChat';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Cała logika jest teraz w hooku useChat
  const {
    users,
    unreadMap,
    loading,
    selectedUser,
    selectUser,
    messages,
    isTyping,
    sendMessage,
    sendTypingSignal,
    deselectUser
  } = useChat(user);

  // Obsługa przekierowania z innej strony (np. przycisk "Message" na profilu)
  useEffect(() => {
    if (location.state?.startChatWith) {
      selectUser(location.state.startChatWith);
      // Czyścimy stan, żeby po odświeżeniu nie wracało do tego samego
      window.history.replaceState({}, document.title);
    }
  }, [location.state, selectUser]);

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto border-x border-white/5">
      <ChatSidebar 
        users={users} 
        selectedUser={selectedUser} 
        onSelectUser={selectUser} 
        unreadMap={unreadMap} 
        loading={loading}
      />
      
      <ChatWindow 
        selectedUser={selectedUser}
        messages={messages}
        currentUser={user}
        onSendMessage={sendMessage}
        onTyping={sendTypingSignal}
        isTyping={isTyping}
        onBack={deselectUser}
      />
    </div>
  );
};

export default Chat;