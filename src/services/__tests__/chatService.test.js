import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  searchUsers, 
  getRecentChatPartners, 
  getConversation, 
  getUnreadMessages, 
  markMessagesAsRead, 
  sendMessageToApi 
} from '../../services/chatService'; 
import { supabase } from '../../supabaseClient'; 

// Magia: Zaawansowany mock dla łańcuchów (chainingu) zapytań w Supabase
const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

vi.mock('../../supabaseClient', () => {
  return {
    supabase: {
      rpc: vi.fn(),
      from: vi.fn(() => mockSupabaseQuery)
    }
  };
});

describe('Chat Service (Mocked DB)', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Czyścimy pamięć mocków przed każdym testem
  });

  // 1. getRecentChatPartners (Linie 1-12)
  it('getRecentChatPartners wywołuje odpowiednią procedurę RPC', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: ['partner1'], error: null });
    const data = await getRecentChatPartners('user-1');
    expect(supabase.rpc).toHaveBeenCalledWith('get_recent_chat_partners', { current_user_id: 'user-1' });
    expect(data).toEqual(['partner1']);
  });

  // 2. searchUsers (Linie 14-29)
  it('searchUsers zwraca puste dane, jeśli query jest za krótkie', async () => {
    const data = await searchUsers('a', 'user-1');
    expect(data).toEqual([]); 
  });

  it('searchUsers wywołuje supabase z poprawnymi filtrami', async () => {
    mockSupabaseQuery.limit.mockResolvedValueOnce({ data: [{ id: 1, name: 'Janek' }], error: null });
    const data = await searchUsers('Janek', 'user-1');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(data).toEqual([{ id: 1, name: 'Janek' }]);
  });

  // 3. getConversation (Linie 37-53)
  it('getConversation pobiera i odwraca wiadomości', async () => {
    // Zwracamy tablicę [1, 2], a funkcja robi na niej .reverse()
    mockSupabaseQuery.limit.mockResolvedValueOnce({ 
      data: [{ id: 1, content: 'msg1' }, { id: 2, content: 'msg2' }], 
      error: null 
    });
    
    const data = await getConversation('user-1', 'user-2');
    
    expect(supabase.from).toHaveBeenCalledWith('messages');
    expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    // Odwrócone wyniki:
    expect(data).toEqual([{ id: 2, content: 'msg2' }, { id: 1, content: 'msg1' }]); 
  });

  it('getConversation dodaje filtr lastTimestamp, jeśli podano', async () => {
    // Mockujemy na metodzie .lt(), bo to ona zamyka łańcuch, gdy jest timestamp
    mockSupabaseQuery.lt.mockResolvedValueOnce({ data: [], error: null });
    
    await getConversation('user-1', 'user-2', 10, '2025-01-01');
    expect(mockSupabaseQuery.lt).toHaveBeenCalledWith('created_at', '2025-01-01');
  });

// 4. getUnreadMessages (Linie 57-69)
  it('getUnreadMessages zlicza nieprzeczytane wiadomości z podziałem na nadawców', async () => {
    // NAPRAWA: Pierwsze wywołanie zwraca mocka (pozwala na łańcuch), drugie zwraca dane!
    mockSupabaseQuery.eq
      .mockReturnValueOnce(mockSupabaseQuery) // dla pierwszego .eq('receiver_id', ...)
      .mockResolvedValueOnce({                // dla drugiego .eq('is_read', false)
        data: [
          { sender_id: 'user-A' }, 
          { sender_id: 'user-A' }, 
          { sender_id: 'user-B' }
        ], 
        error: null 
      });
    
    const result = await getUnreadMessages('current-user');
    
    expect(supabase.from).toHaveBeenCalledWith('messages');
    expect(result).toEqual({ 'user-A': 2, 'user-B': 1 }); 
  });
  // 5. markMessagesAsRead (Linie 73-75)
  it('markMessagesAsRead ignoruje puste tablice (wczesny return)', async () => {
    await markMessagesAsRead([]);
    expect(supabase.from).not.toHaveBeenCalled(); 
  });

  it('markMessagesAsRead aktualizuje podane ID wiadomości', async () => {
    mockSupabaseQuery.in.mockResolvedValueOnce({ data: null, error: null });
    
    await markMessagesAsRead([1, 2, 3]);
    
    expect(supabase.from).toHaveBeenCalledWith('messages');
    expect(mockSupabaseQuery.update).toHaveBeenCalledWith({ is_read: true });
    expect(mockSupabaseQuery.in).toHaveBeenCalledWith('id', [1, 2, 3]);
  });

  // 6. sendMessageToApi (Koniec pliku)
  it('sendMessageToApi wstawia wiadomość i zwraca dane', async () => {
    mockSupabaseQuery.single.mockResolvedValueOnce({ data: { id: 99, content: 'hej' }, error: null });
    
    const data = await sendMessageToApi('user-1', 'user-2', 'hej');
    
    expect(mockSupabaseQuery.insert).toHaveBeenCalledWith([{ sender_id: 'user-1', receiver_id: 'user-2', content: 'hej' }]);
    expect(data).toEqual({ id: 99, content: 'hej' });
  });
});