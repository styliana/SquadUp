import { supabase } from '../supabaseClient';

/**
 * Pobiera listę użytkowników do czatu (z pominięciem zalogowanego).
 * Pobieramy tylko niezbędne pola dla optymalizacji.
 */
export const getChatUsers = async (currentUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, university') 
    .neq('id', currentUserId);

  if (error) throw error;
  return data;
};

/**
 * Pobiera liczniki nieprzeczytanych wiadomości dla danego usera.
 * Zwraca mapę: { sender_id: liczba_nieprzeczytanych }
 */
export const getUnreadMessages = async (currentUserId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('receiver_id', currentUserId)
    .eq('is_read', false);

  if (error) throw error;
  
  const map = {};
  data?.forEach(msg => {
    map[msg.sender_id] = (map[msg.sender_id] || 0) + 1;
  });
  return map;
};

/**
 * Pobiera historię rozmowy między dwojgiem użytkowników.
 */
export const getConversation = async (user1, user2) => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, sender_id, receiver_id, created_at, is_read')
    .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Oznacza listę wiadomości jako przeczytane.
 */
export const markMessagesAsRead = async (messageIds) => {
  if (!messageIds || messageIds.length === 0) return;
  
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .in('id', messageIds);

  if (error) throw error;
};

/**
 * Wysyła nową wiadomość i ZWRACA jej pełny obiekt z bazy (w tym prawdziwe ID).
 * Jest to kluczowe dla poprawnego działania Optimistic UI i aktualizacji statusu przeczytania.
 */
export const sendMessageToApi = async (senderId, receiverId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      content: content
    }])
    .select() // WAŻNE: Wymusza zwrócenie utworzonego rekordu
    .single();

  if (error) throw error;
  return data; // Zwracamy obiekt wiadomości z prawdziwym ID i created_at
};