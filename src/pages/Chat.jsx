import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Stan danych
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Stan UI
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Referencje dla logiki
  const typingTimeoutRef = useRef(null);
  const channelRef = useRef(null);

  // 1. INICJALIZACJA: Pobierz listę userów i mapę nieprzeczytanych
  useEffect(() => {
    const initChat = async () => {
      if (!user) return;

      // Pobierz użytkowników
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);
      
      setUsers(usersData || []);
      setLoading(false);

      // Pobierz liczniki nieprzeczytanych wiadomości
      const { data: unreadData } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      const map = {};
      unreadData?.forEach(msg => {
        map[msg.sender_id] = (map[msg.sender_id] || 0) + 1;
      });
      setUnreadMap(map);
    };

    initChat();

    // Nasłuchuj globalnie na nowe wiadomości (żeby aktualizować liczniki po lewej)
    const globalChannel = supabase.channel('global_chat_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          setUnreadMap(prev => ({
            ...prev,
            [payload.new.sender_id]: (prev[payload.new.sender_id] || 0) + 1
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user]);

  // Obsługa przekierowania z profilu (np. przycisk "Message")
  useEffect(() => {
    if (location.state?.startChatWith) {
      handleSelectUser(location.state.startChatWith);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 2. WYBÓR UŻYTKOWNIKA I SUBSKRYPCJA POKOJU
  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    // Czyścimy licznik powiadomień dla tego usera lokalnie
    setUnreadMap(prev => {
      const newMap = { ...prev };
      delete newMap[u.id];
      return newMap;
    });

    if (!user) return;

    // A. Pobierz historię
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${u.id}),and(sender_id.eq.${u.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    setMessages(data || []);

    // B. Oznacz jako przeczytane w bazie
    const unreadIds = data?.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id);
    if (unreadIds?.length > 0) {
      await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
    }

    // C. Subskrybuj pokój (Realtime)
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const roomId = [user.id, u.id].sort().join('_');
    const channel = supabase.channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        async (payload) => {
          if (payload.new.sender_id === u.id) {
            setMessages(prev => [...prev, payload.new]);
            // Oznaczamy od razu jako przeczytane, bo mamy otwarte okno
            await supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
            
            // Ponownie czyścimy mapę dla pewności
            setUnreadMap(prev => {
                const newMap = { ...prev };
                delete newMap[u.id];
                return newMap;
            });
          }
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender_id === u.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;
  };

  // 3. WYSYŁANIE WIADOMOŚCI
  const handleSendMessage = async (content) => {
    if (!selectedUser) return;

    // Optimistic UI Update
    const optimisticMsg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: content,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setMessages(prev => [...prev, optimisticMsg]);

    await supabase.from('messages').insert([{
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: content
    }]);
  };

  const handleTyping = () => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: user.id }
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto border-x border-white/5">
      <ChatSidebar 
        users={users} 
        selectedUser={selectedUser} 
        onSelectUser={handleSelectUser} 
        unreadMap={unreadMap} 
        loading={loading}
      />
      
      <ChatWindow 
        selectedUser={selectedUser}
        messages={messages}
        currentUser={user}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        isTyping={isTyping}
        onBack={() => setSelectedUser(null)}
      />
    </div>
  );
};

export default Chat;