import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  // NOWA SEKCJA TESTOWA
  test: {
    globals: true,             // Pozwala używać 'describe', 'it', 'expect' bez importowania
    environment: 'jsdom',      // Symulacja przeglądarki
    setupFiles: './src/setupTests.js', // Plik konfiguracyjny (zaraz go stworzymy)
  },
})