/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neural: {
          bg: '#0a0a0a',
          surface: '#111111',
          card: '#0f0f0f',
          border: 'rgba(255,255,255,0.1)',
        },
        gold: {
          base: '#a78b71',
          light: '#c9b8a0',
          hover: '#e8d5b7',
          muted: 'rgba(167,139,113,0.4)',
          subtle: 'rgba(167,139,113,0.1)',
        },
      },
      backgroundImage: {
        'glass-glow': 'radial-gradient(circle, rgba(167,139,113,0.1) 0%, transparent 70%)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(167,139,113,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(167,139,113,0.7)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
