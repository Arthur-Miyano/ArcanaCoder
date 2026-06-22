/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        magic: {
          bg: '#1e1e32',
          card: '#16213e',
          accent: '#4B0082',
          'accent-light': '#5a0099',
          gold: '#c9a227',
          text: '#e0e0e0',
        },
      },
    },
  },
  plugins: [],
}
