
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#711612',
          dark: '#5a100e',
          light: '#8f1d18',
        },
        burgundy: {
          DEFAULT: '#711612',
          50: '#fdf3f2',
          100: '#fae3e2',
          200: '#f5cbc9',
          300: '#eda5a2',
          400: '#e1726d',
          500: '#ce4640',
          600: '#711612',
          700: '#5a100e',
          800: '#480d0b',
          900: '#320908',
          light: '#8f1d18',
          dark: '#5a100e',
        },
        bg: {
          DEFAULT: '#EBEAE8',
          dark: '#d8d6d3',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#e0c45a',
          dark: '#b8941f',
        },
        charcoal: {
          DEFAULT: '#2C2C2C',
          light: '#444444',
          lighter: '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(113, 22, 18, 0.12)',
        'gold': '0 4px 20px rgba(212, 175, 55, 0.3)',
        'card': '0 2px 20px rgba(44, 44, 44, 0.08)',
        'card-hover': '0 8px 40px rgba(44, 44, 44, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
