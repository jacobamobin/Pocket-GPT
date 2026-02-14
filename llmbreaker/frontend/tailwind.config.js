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
          bg: '#050a14',
          surface: '#0d1b2a',
          card: '#112240',
          border: '#1e3a5f',
        },
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },
      backgroundImage: {
        'neural-gradient': 'linear-gradient(135deg, #050a14 0%, #0d1b2a 50%, #112240 100%)',
        'glow-blue': 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(59,130,246,0.7)' },
        },
      },
    },
  },
  plugins: [],
}
