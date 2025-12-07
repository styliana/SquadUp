/** @type {import('tailwindcss').Config} */
module.exports = {
  // Wskaż pliki, które Tailwind ma skanować
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Rozszerzamy domyślny motyw
    extend: {
      // PALETA KOLORÓW (dla estetyki ciemnego motywu)
      colors: {
        'primary': '#06b6d4',      // Jasny Turkus (Akcent)
        'secondary': '#8b5cf6',    // Fiolet (Dodatkowy Akcent)
        'background': '#111827',   // Bardzo Ciemne Tło
        'surface': '#1f2937',      // Powierzchnia Kart / Paneli
        'textMain': '#f9fafb',     // Biały/Jasny Tekst Główny
        'textMuted': '#9ca3af',    // Szary Tekst Wyciszony
      },
      // DEFINIOWANIE FONTU
      fontFamily: {
        // Manrope jako domyślny font dla 'sans' (dla całej aplikacji)
        sans: ['Manrope', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}