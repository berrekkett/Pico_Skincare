/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'peach': {
          25: '#FFFBF7',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FFDAB9',
          300: '#FDC896',
          400: '#FB923C',
          500: '#F97316',
        },
        'rose': {
          25: '#FFFBFB',
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECACA',
          300: '#F8BBD9',
          400: '#FB7185',
          500: '#F43F5E',
        }
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};