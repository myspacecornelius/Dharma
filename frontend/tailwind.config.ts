import type { Config } from 'tailwindcss'
export default {
  darkMode: ['class'],
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
    extend: {
      fontFamily: { sans: ['ui-sans-serif','system-ui','-apple-system','Inter','Segoe UI','Roboto','sans-serif'] },
      colors: {
        brand: { 50:'#f6f7ff', 100:'#eceeff', 200:'#d9dcff', 300:'#b9befc', 400:'#8d91f7', 500:'#6d71f2', 600:'#5558d0', 700:'#4548a7', 800:'#3a3d86', 900:'#33366f' }
      },
      borderRadius: { xl: '1rem' },
      boxShadow: { soft: '0 8px 30px rgba(0,0,0,.06)' },
      ringColor: {
        DEFAULT: '#2563eb',
        brand: { 50:'#f6f7ff', 100:'#eceeff', 200:'#d9dcff', 300:'#b9befc', 400:'#8d91f7', 500:'#6d71f2', 600:'#5558d0', 700:'#4548a7', 800:'#3a3d86', 900:'#33366f' }
      }
    }
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
