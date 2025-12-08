import { supabase } from '../supabaseClient';

/**
 * 1. SKALOWALNOŚĆ: Zamiast pobierać wszystkich, pobieramy tylko tych,
 * z którymi użytkownik już rozmawiał (używając funkcji SQL RPC).
 */
export const getRecentChatPartners = async (currentUserId) => {
  const { data, error } = await supabase
    .rpc('get_recent_chat_partners', { current_user_id: currentUserId });

  if (error) throw error;
  return data;
};

/**
 * 2. SKALOWALNOŚĆ: Server-Side Search.
 * Szukamy użytkowników w bazie pasujących do frazy (nie pobieramy wszystkich do RAMu).
 */
export const searchUsers = async (query, currentUserId) => {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, university')
    .neq('id', currentUserId)
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`) // Szukaj po nazwie LUB emailu
    .limit(10); // Pobierz max 10 wyników

  if (error) throw error;
  return data;
};

// ... reszta funkcji bez zmian (ale dla porządku podaję całość) ...

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

export const getConversation = async (user1, user2) => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, sender_id, receiver_id, created_at, is_read')
    .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
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