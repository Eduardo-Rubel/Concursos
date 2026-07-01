/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0e1015',
        surface: '#15181e',
        'surface-hover': '#1e222a',
        border: '#2a2e37',
        muted: '#8f95b2',
        foreground: '#f8f9fb',
        primary: '#4f46e5',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      }
    },
  },
  plugins: [],
}
