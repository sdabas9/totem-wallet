/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        totem: {
          bg: '#0f0f13',
          surface: '#1a1a24',
          border: '#2a2a3a',
          primary: '#6366f1',
          'primary-hover': '#818cf8',
          accent: '#22d3ee',
          text: '#e2e8f0',
          'text-dim': '#94a3b8',
          success: '#22c55e',
          error: '#ef4444',
          warning: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
