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
  
  // Stan paginacji
  const [hasMore, setHasMore] = useState(true);
  const MESSAGES_PER_PAGE = 10;
  
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Odświeżanie listy kontaktów
  const refreshContactList = useCallback(async () => {
    if (!currentUser) return;
    try {
      const recentContacts = await getRecentChatPartners(currentUser.id);
      setUsers(recentContacts || []);
    } catch (error) {
      console.error("Failed to refresh contacts:", error);
    }
  }, [currentUser]);

  // Inicjalizacja i nasłuch globalny
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

    const globalChannel = supabase.channel('global_chat_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `receiver_id=eq.${currentUser.id}` 
      },
        async (payload) => {
          setUnreadMap(prev => ({ 
            ...prev, 
            [payload.new.sender_id]: (prev[payload.new.sender_id] || 0) + 1 
          }));
          await refreshContactList();
        }
      ).subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, [currentUser, refreshContactList]);

  // Paginacja: Ładowanie starszych wiadomości
  const loadMoreMessages = async () => {
    if (!hasMore || !selectedUser || messages.length === 0) return;

    // Pobieramy timestamp najstarszej wiadomości jaką mamy w stanie
    const oldestTimestamp = messages[0].created_at;

    try {
      const olderMessages = await getConversation(
        currentUser.id, 
        selectedUser.id, 
        MESSAGES_PER_PAGE, 
        oldestTimestamp
      );

      if (olderMessages.length < MESSAGES_PER_PAGE) {
        setHasMore(false);
      }

      // Doklejamy starsze wiadomości na początek listy
      setMessages(prev => [...olderMessages, ...prev]);
    } catch (error) {
      console.error("Load more messages error:", error);
      toast.error("Could not load older messages");
    }
  };

  const selectUser = useCallback(async (userToChat) => {
    if (!currentUser) return;
    setSelectedUser(userToChat);
    setHasMore(true); // Resetujemy flagę "więcej" dla nowego rozmówcy
    
    setUnreadMap(prev => { 
      const newMap = { ...prev }; 
      delete newMap[userToChat.id]; 
      return newMap; 
    });

    try {
      // Pobieramy pierwszą paczkę (10 najnowszych)
      const history = await getConversation(currentUser.id, userToChat.id, MESSAGES_PER_PAGE);
      setMessages(history || []);
      setHasMore(history.length === MESSAGES_PER_PAGE);
      // Jeśli pobraliśmy mniej niż limit, to znaczy że nie ma więcej historii
      if (history.length < MESSAGES_PER_PAGE) {
        setHasMore(false);
      }
      
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
      await refreshContactList();
    } catch (error) { 
      console.error(error); 
      toast.error("Failed to send"); 
    }
  };

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
    handleSearch,
    hasMore,             // Eksportujemy stan paginacji
    loadMoreMessages      // Eksportujemy funkcję ładowania
  };
};