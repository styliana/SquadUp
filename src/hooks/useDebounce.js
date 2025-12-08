import { useState, useEffect } from 'react';

/**
 * Hook opóźniający aktualizację wartości.
 * Przydatny przy wyszukiwaniu, aby nie wysyłać zapytania do API przy każdym znaku.
 * * @param {any} value - Wartość do obserwowania (np. tekst z inputa)
 * @param {number} delay - Opóźnienie w milisekundach (np. 300ms)
 * @returns {any} - Opóźniona wartość
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Ustaw timer, który zaktualizuje wartość po upływie czasu
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Czyszczenie timera, jeśli wartość zmieni się przed upływem czasu
    // (To tutaj dzieje się magia anulowania poprzednich wywołań)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};