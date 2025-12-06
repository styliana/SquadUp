/** @type {import('tailwindcss').Config} */
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- TA LINIJKA JEST KLUCZOWA
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0B1120', 
        surface: '#1e293b',    
        primary: '#06b6d4',    
        secondary: '#a855f7',  
        textMain: '#f8fafc',   
        textMuted: '#94a3b8',
        
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "#f8fafc",
      },
    },
  },
  plugins: [tailwindAnimate],
}