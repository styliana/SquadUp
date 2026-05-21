/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        textMain: 'hsl(var(--text-main) / <alpha-value>)',
        textMuted: 'hsl(var(--text-muted) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        
        primary: 'hsl(var(--primary) / <alpha-value>)',
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)', // Rejestracja nowego koloru

        // Przekierowanie niebieskiego na Cyjan
        blue: { DEFAULT: 'hsl(var(--primary))', 50: 'hsl(var(--primary)/0.1)', 100: 'hsl(var(--primary)/0.2)', 200: 'hsl(var(--primary)/0.3)', 300: 'hsl(var(--primary)/0.4)', 400: 'hsl(var(--primary)/0.8)', 500: 'hsl(var(--primary))', 600: 'hsl(var(--primary))', 700: 'hsl(var(--primary))', 800: 'hsl(var(--primary))', 900: 'hsl(var(--primary))' },
        
        // Przekierowanie WSZYSTKICH zieleni na Twój nowy #06D481!
        green: { DEFAULT: 'hsl(var(--success))', 50: 'hsl(var(--success)/0.1)', 100: 'hsl(var(--success)/0.2)', 200: 'hsl(var(--success)/0.3)', 300: 'hsl(var(--success)/0.4)', 400: 'hsl(var(--success)/0.8)', 500: 'hsl(var(--success))', 600: 'hsl(var(--success))', 700: 'hsl(var(--success))', 800: 'hsl(var(--success))', 900: 'hsl(var(--success))' },
        emerald: { DEFAULT: 'hsl(var(--success))', 50: 'hsl(var(--success)/0.1)', 100: 'hsl(var(--success)/0.2)', 200: 'hsl(var(--success)/0.3)', 300: 'hsl(var(--success)/0.4)', 400: 'hsl(var(--success)/0.8)', 500: 'hsl(var(--success))', 600: 'hsl(var(--success))', 700: 'hsl(var(--success))', 800: 'hsl(var(--success))', 900: 'hsl(var(--success))' },
        
        // Przekierowanie czerwieni na Pomarańcz
        red: { DEFAULT: 'hsl(var(--secondary))', 50: 'hsl(var(--secondary)/0.1)', 100: 'hsl(var(--secondary)/0.2)', 200: 'hsl(var(--secondary)/0.3)', 300: 'hsl(var(--secondary)/0.4)', 400: 'hsl(var(--secondary)/0.8)', 500: 'hsl(var(--secondary))', 600: 'hsl(var(--secondary))', 700: 'hsl(var(--secondary))', 800: 'hsl(var(--secondary))', 900: 'hsl(var(--secondary))' },
        pink: { DEFAULT: 'hsl(var(--secondary))', 50: 'hsl(var(--secondary)/0.1)', 100: 'hsl(var(--secondary)/0.2)', 200: 'hsl(var(--secondary)/0.3)', 300: 'hsl(var(--secondary)/0.4)', 400: 'hsl(var(--secondary)/0.8)', 500: 'hsl(var(--secondary))', 600: 'hsl(var(--secondary))', 700: 'hsl(var(--secondary))', 800: 'hsl(var(--secondary))', 900: 'hsl(var(--secondary))' },

        // Przekierowanie żółtego/fioletowego na Miodowy
        yellow: { DEFAULT: 'hsl(var(--accent))', 50: 'hsl(var(--accent)/0.1)', 100: 'hsl(var(--accent)/0.2)', 200: 'hsl(var(--accent)/0.3)', 300: 'hsl(var(--accent)/0.4)', 400: 'hsl(var(--accent)/0.8)', 500: 'hsl(var(--accent))', 600: 'hsl(var(--accent))', 700: 'hsl(var(--accent))', 800: 'hsl(var(--accent))', 900: 'hsl(var(--accent))' },
        purple: { DEFAULT: 'hsl(var(--accent))', 50: 'hsl(var(--accent)/0.1)', 100: 'hsl(var(--accent)/0.2)', 200: 'hsl(var(--accent)/0.3)', 300: 'hsl(var(--accent)/0.4)', 400: 'hsl(var(--accent)/0.8)', 500: 'hsl(var(--accent))', 600: 'hsl(var(--accent))', 700: 'hsl(var(--accent))', 800: 'hsl(var(--accent))', 900: 'hsl(var(--accent))' },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'], 
      },
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
}