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