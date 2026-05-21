import { describe, it, expect } from 'vitest';
import { formatDate, formatForInput } from '../formatDate';

describe('Funkcja formatDate()', () => {
  it('zwraca pusty string, jeśli nie podano daty', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('zwraca tylko czas, gdy użyto opcji timeOnly', () => {
    const testDate = new Date('2024-05-15T14:30:00');
    // UWAGA: Wynik może zależeć od strefy czasowej maszyny testującej. 
    // Sprawdzamy czy zawiera format godziny.
    const result = formatDate(testDate, { timeOnly: true });
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('zwraca czas, jeśli data to dzisiaj i włączono opcję relative', () => {
    // Tworzymy datę "dzisiaj"
    const today = new Date();
    const result = formatDate(today, { relative: true });
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('formuje datę do formatu np. "15 May" dla innej daty w tym samym roku', () => {
    const now = new Date();
    // Ustawiamy inny miesiąc (żeby nie było to dzisiaj) w tym samym roku
    const pastDate = new Date(now.getFullYear(), 1, 15); // 15 Lutego
    
    const result = formatDate(pastDate);
    // Sprawdzamy, czy w wyniku jest dzień
    expect(result).toContain('15');
    // Jeśli to ten sam rok, domyślna implementacja (w wielu przeglądarkach) nie pokazuje roku
    expect(result).not.toContain(now.getFullYear().toString());
  });
});

describe('Funkcja formatForInput()', () => {
  it('zwraca pusty string, jeśli nie podano daty', () => {
    expect(formatForInput(null)).toBe('');
  });

  it('formuje pełną datę z czasem do formatu YYYY-MM-DD', () => {
    // Używamy daty UTC, aby uniknąć problemów ze strefami czasowymi
    const testDate = '2025-12-24T18:30:00.000Z';
    expect(formatForInput(testDate)).toBe('2025-12-24');
  });

  it('formuje krótką datę bez zmian (zachowuje format YYYY-MM-DD)', () => {
    const testDate = '2023-01-01';
    expect(formatForInput(testDate)).toBe('2023-01-01');
  });
});