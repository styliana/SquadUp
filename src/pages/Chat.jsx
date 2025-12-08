import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useChat } from '../hooks/useChat';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  
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
    deselectUser,
    handleSearch 
  } = useChat(user);

  useEffect(() => {
    if (location.state?.startChatWith) {
      selectUser(location.state.startChatWith);
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
        onSearch={handleSearch} 
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