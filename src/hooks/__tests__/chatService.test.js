import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessageToApi } from '../../services/chatService';
import { supabase } from '../../supabaseClient';

// MOCKOWANIE SUPABASE
// Zastępujemy prawdziwego klienta naszą "wydmuszką", która zwraca to, co chcemy
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('chatService - sendMessageToApi', () => {
  // Czyścimy mocki przed każdym testem
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully send a message and return data', async () => {
    // 1. Przygotowanie danych (Arrange)
    const mockResponse = { 
      id: 123, 
      content: 'Hello World', 
      created_at: '2023-01-01' 
    };
    
    // Konfigurujemy mocka tak, aby zwracał sukces
    const singleMock = vi.fn().mockResolvedValue({ data: mockResponse, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    
    // Wstrzykujemy naszą implementację do mocka
    supabase.from.mockReturnValue({ insert: insertMock });

    // 2. Działanie (Act)
    const result = await sendMessageToApi('user1', 'user2', 'Hello World');

    // 3. Weryfikacja (Assert)
    // Sprawdzamy czy funkcja wywołała odpowiednie metody Supabase
    expect(supabase.from).toHaveBeenCalledWith('messages');
    expect(insertMock).toHaveBeenCalledWith([{
      sender_id: 'user1',
      receiver_id: 'user2',
      content: 'Hello World'
    }]);
    
    // Sprawdzamy czy zwróciła to, co dała "baza"
    expect(result).toEqual(mockResponse);
  });

  it('should throw error when supabase fails', async () => {
    // Symulujemy błąd bazy danych
    const mockError = { message: 'Network error' };
    
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    supabase.from.mockReturnValue({ insert: insertMock });

    // Sprawdzamy czy funkcja rzuciła wyjątek
    await expect(sendMessageToApi('u1', 'u2', 'hi'))
      .rejects
      .toThrow('Network error');
  });
});