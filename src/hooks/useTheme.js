import { useEffect, useState } from 'react';

export function useTheme() {
  // 1. Inicjalizacja stanu (z localStorage lub ustawień systemu)
  const [theme, setTheme] = useState(() => {
    // Sprawdzamy czy kod działa w przeglądarce
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      
      // Jeśli brak zapisu, sprawdź preferencje systemu
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Domyślny fallback
  });

  // 2. Efekt uboczny: Aktualizacja klasy na elemencie <html>
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Zapisz wybór, żeby pamiętać po odświeżeniu
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. Funkcja przełączająca
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}