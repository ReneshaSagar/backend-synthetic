/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        framer: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          border: '#EAEAEA',
          text: '#111111',
          muted: '#888888',
          accent: '#000000',
        }
      },
      boxShadow: {
        'framer': '0 20px 40px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.05)',
        'framer-hover': '0 30px 60px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0,0,0,0.05)',
        'framer-glow': '0 0 40px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
