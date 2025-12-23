import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { 
  getRecentChatPartners, 
  searchUsers,           
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
  const searchTimeoutRef = useRef(null); // Ref do obsługi debouncing wyszukiwania

  // Funkcja pomocnicza do odświeżania listy kontaktów (sortowanie po dacie)
  const refreshContactList = useCallback(async () => {
    if (!currentUser) return;
    try {
      const recentContacts = await getRecentChatPartners(currentUser.id);
      setUsers(recentContacts || []);
    } catch (error) {
      console.error("Failed to refresh contacts:", error);
    }
  }, [currentUser]);

  // 1. INICJALIZACJA I NASŁUCH GLOBALNY
  useEffect(() => {
    if (!currentUser) return;

    const initData = async () => {
      try {
        const [recentContacts, unreadData] = await Promise.all([
          getRecentChatPartners(currentUser.id),
          getUnreadMessages(currentUser.id)
        ]);
        setUsers(recentContacts || []);
        setUnreadMap(unreadData);
      } catch (error) {
        console.error("Chat init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // Nasłuch na nowe wiadomości przychodzące (zmienia kolejność na liście)
    const globalChannel = supabase.channel('global_chat_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `receiver_id=eq.${currentUser.id}` 
      },
        async (payload) => {
          // Zwiększ licznik nieprzeczytanych
          setUnreadMap(prev => ({ 
            ...prev, 
            [payload.new.sender_id]: (prev[payload.new.sender_id] || 0) + 1 
          }));
          
          // KLUCZOWE: Odśwież listę, aby osoba która napisała wskoczyła na górę
          await refreshContactList();
        }
      ).subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, [currentUser, refreshContactList]);

  // NOWA FUNKCJA: Obsługa wyszukiwania
  const handleSearch = async (query) => {
    if (!query) {
      refreshContactList();
      return;
    }
    
    try {
      const results = await searchUsers(query, currentUser.id);
      setUsers(results);
    } catch (error) {
      console.error("Search error", error);
    }
  };

  const selectUser = useCallback(async (userToChat) => {
    if (!currentUser) return;
    setSelectedUser(userToChat);
    
    // Wyczyść nieprzeczytane dla tego użytkownika lokalnie
    setUnreadMap(prev => { 
      const newMap = { ...prev }; 
      delete newMap[userToChat.id]; 
      return newMap; 
    });

    try {
      const history = await getConversation(currentUser.id, userToChat.id);
      setMessages(history || []);
      
      const unreadIds = history?.filter(m => m.receiver_id === currentUser.id && !m.is_read).map(m => m.id);
      if (unreadIds?.length > 0) markMessagesAsRead(unreadIds);

      if (channelRef.current) supabase.removeChannel(channelRef.current);
      
      const roomId = [currentUser.id, userToChat.id].sort().join('_');
      const channel = supabase.channel(`room_${roomId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `receiver_id=eq.${currentUser.id}` 
        }, async (payload) => {
             if (payload.new.sender_id === userToChat.id) {
               setMessages(prev => [...prev, payload.new]);
               markMessagesAsRead([payload.new.id]);
             }
          })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages', 
          filter: `sender_id=eq.${currentUser.id}` 
        }, (payload) => {
            setMessages(current => current.map(msg => 
              msg.id === payload.new.id ? { ...msg, is_read: payload.new.is_read } : msg
            ));
          })
        .on('broadcast', { event: 'typing' }, (payload) => {
          if (payload.payload.sender_id === userToChat.id) {
            setIsTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
          }
        }).subscribe();
      channelRef.current = channel;
    } catch (error) { 
      console.error(error); 
      toast.error("Failed to open conversation"); 
    }
  }, [currentUser]);

  const sendMessage = async (content) => {
    if (!currentUser || !selectedUser) return;
    const tempId = Date.now();
    const optimisticMsg = { 
      id: tempId, 
      sender_id: currentUser.id, 
      receiver_id: selectedUser.id, 
      content, 
      created_at: new Date().toISOString(), 
      is_read: false 
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    
    try {
      const realMessage = await sendMessageToApi(currentUser.id, selectedUser.id, content);
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, id: realMessage.id } : msg));
      
      // KLUCZOWE: Po wysłaniu wiadomości odśwież listę, aby rozmówca wskoczył na górę Twojej listy
      await refreshContactList();
      
    } catch (error) { 
      console.error(error); 
      toast.error("Failed to send"); 
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

  useEffect(() => () => { 
    if (channelRef.current) supabase.removeChannel(channelRef.current); 
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
    deselectUser: () => setSelectedUser(null),
    handleSearch 
  };
};