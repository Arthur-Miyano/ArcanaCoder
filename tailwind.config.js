/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 星渊 Abyss — 深邃底色
        abyss: {
          950: '#04060d',
          900: '#0a0e1a',
          850: '#0d1224',
          800: '#111730',
          700: '#182040',
          600: '#212a52',
        },
        // 奥术 Arcane — 星紫主色
        arcane: {
          200: '#cdc3ff',
          300: '#b3a6ff',
          400: '#9d8cff',
          500: '#7c6aff',
          600: '#6a54e8',
          700: '#5442c4',
        },
        // 秘金 Gold — 点缀与稀有高亮
        gold: {
          200: '#f4e3a1',
          300: '#ecd27a',
          400: '#e0be55',
          500: '#d4af37',
          600: '#b8942a',
        },
        // 雾 Mist — 中性文字
        mist: {
          100: '#eef0fa',
          200: '#c9cede',
          300: '#a7adc2',
          400: '#7e8499',
          500: '#5a6076',
        },
        // 兼容旧类名（过渡期，逐步替换）
        magic: {
          bg: '#0a0e1a',
          card: '#111730',
          accent: '#5442c4',
          'accent-light': '#7c6aff',
          gold: '#d4af37',
          text: '#c9cede',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Serif SC"', 'serif'],
        body: ['Inter', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-arcane': '0 0 24px -4px rgba(124, 106, 255, 0.45)',
        'glow-arcane-lg': '0 0 48px -8px rgba(124, 106, 255, 0.5)',
        'glow-gold': '0 0 24px -4px rgba(212, 175, 55, 0.45)',
        'card': '0 8px 32px -8px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 16px 48px -12px rgba(0, 0, 0, 0.7), 0 0 24px -8px rgba(124, 106, 255, 0.3)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-120px, -60px, 0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bar-flow': {
          '0%': { backgroundPosition: '0% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        drift: 'drift 90s linear infinite alternate',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'bar-flow': 'bar-flow 3s linear infinite',
      },
    },
  },
  plugins: [],
}
