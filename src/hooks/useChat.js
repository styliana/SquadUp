import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { 
  getChatUsers, 
  getUnreadMessages, 
  getConversation, 
  markMessagesAsRead, 
  sendMessageToApi 
} from '../services/chatService';
import { toast } from 'sonner';

export const useChat = (currentUser) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const initData = async () => {
      try {
        const [usersData, unreadData] = await Promise.all([
          getChatUsers(currentUser.id),
          getUnreadMessages(currentUser.id)
        ]);
        setUsers(usersData);
        setUnreadMap(unreadData);
      } catch (error) {
        console.error("Chat init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();

    const globalChannel = supabase.channel('global_chat_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` },
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
  }, [currentUser]);

  const selectUser = useCallback(async (userToChat) => {
    if (!currentUser) return;
    setSelectedUser(userToChat);
    
    setUnreadMap(prev => {
      const newMap = { ...prev };
      delete newMap[userToChat.id];
      return newMap;
    });

    try {
      const history = await getConversation(currentUser.id, userToChat.id);
      setMessages(history || []);

      const unreadIds = history
        ?.filter(m => m.receiver_id === currentUser.id && !m.is_read)
        .map(m => m.id);
        
      if (unreadIds?.length > 0) {
        markMessagesAsRead(unreadIds);
      }

      if (channelRef.current) supabase.removeChannel(channelRef.current);

      const roomId = [currentUser.id, userToChat.id].sort().join('_');
      
      const channel = supabase.channel(`room_${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` },
          async (payload) => {
             if (payload.new.sender_id === userToChat.id) {
               setMessages(prev => [...prev, payload.new]);
               markMessagesAsRead([payload.new.id]);
               setUnreadMap(prev => {
                  const newMap = { ...prev };
                  delete newMap[userToChat.id];
                  return newMap;
               });
             }
          }
        )
        // NASŁUCH NA UPDATE (Dla ptaszków)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `sender_id=eq.${currentUser.id}` },
          (payload) => {
            // Tutaj payload.new.id to ID z bazy. Musimy mieć pewność, że mamy je w stanie
            setMessages(currentMessages => 
              currentMessages.map(msg => 
                msg.id === payload.new.id ? { ...msg, is_read: payload.new.is_read } : msg
              )
            );
          }
        )
        .on('broadcast', { event: 'typing' }, (payload) => {
          if (payload.payload.sender_id === userToChat.id) {
            setIsTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
          }
        })
        .subscribe();

      channelRef.current = channel;

    } catch (error) {
      console.error("Error selecting user:", error);
      toast.error("Failed to open conversation");
    }
  }, [currentUser]);

  // ZAKTUALIZOWANA FUNKCJA SENDMESSAGE
  const sendMessage = async (content) => {
    if (!currentUser || !selectedUser) return;

    // 1. Tworzymy tymczasowe ID
    const tempId = Date.now();
    
    const optimisticMsg = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: content,
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    // 2. Dodajemy do UI z tymczasowym ID
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      // 3. Wysyłamy i CZEKAMY na prawdziwe dane z bazy
      const realMessage = await sendMessageToApi(currentUser.id, selectedUser.id, content);
      
      // 4. Podmieniamy wiadomość w stanie (Tymczasowe ID -> Prawdziwe ID)
      // Dzięki temu, gdy przyjdzie event UPDATE z bazy, znajdzie on tę wiadomość po prawdziwym ID
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, id: realMessage.id } : msg
      ));

    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send message");
      // Opcjonalnie: Usuń wiadomość z listy, jeśli wysyłanie się nie powiodło
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const sendTypingSignal = () => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: currentUser.id }
      });
    }
  };

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  return {
    users,
    unreadMap,
    loading,
    selectedUser,
    selectUser,
    messages,
    isTyping,
    sendMessage,
    sendTypingSignal,
    deselectUser: () => setSelectedUser(null)
  };
};