import { supabase } from '../supabaseClient';

/**
 * 1. SKALOWALNOŚĆ: Pobiera partnerów czatu posortowanych według daty 
 * ostatniej wiadomości (wymaga funkcji SQL RPC get_recent_chat_partners).
 */
export const getRecentChatPartners = async (currentUserId) => {
  const { data, error } = await supabase
    .rpc('get_recent_chat_partners', { current_user_id: currentUserId });

  if (error) throw error;
  return data;
};

/**
 * 2. SKALOWALNOŚĆ: Server-Side Search.
 */
export const searchUsers = async (query, currentUserId) => {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, university')
    .neq('id', currentUserId)
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
};

/**
 * 3. PAGINACJA: Pobiera fragment rozmowy (domyślnie 10 wiadomości).
 * Jeśli podasz lastTimestamp, pobierze wiadomości STARSZE niż ten czas.
 */
export const getConversation = async (user1, user2, limit = 10, lastTimestamp = null) => {
  let query = supabase
    .from('messages')
    .select('id, content, sender_id, receiver_id, created_at, is_read')
    .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
    .order('created_at', { ascending: false }) // Najpierw najnowsze, aby limit działał poprawnie
    .limit(limit);

  if (lastTimestamp) {
    query = query.lt('created_at', lastTimestamp); // "lt" oznacza "less than" (starsze niż)
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Odwracamy tablicę przed zwróceniem, aby w czacie były chronologicznie (od najstarszej do najnowszej)
  return data.reverse();
};

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

export const markMessagesAsRead = async (messageIds) => {
  if (!messageIds || messageIds.length === 0) return;
  const { error } = await supabase.from('messages').update({ is_read: true }).in('id', messageIds);
  if (error) throw error;
};

export const sendMessageToApi = async (senderId, receiverId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content: content }])
    .select().single();
  if (error) throw error;
  return data;
};