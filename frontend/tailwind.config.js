/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: { 50: '#FFF8F0', 100: '#FFECD6', 200: '#FFD4A8', 300: '#FFBB7A', 400: '#FFA04D', 500: '#FF8720', 600: '#E06A00', 700: '#A34D00', 800: '#6B3300', 900: '#331900' },
        tricolor: { green: '#138808', white: '#FFFFFF', orange: '#FF9933', blue: '#000080' },
        navy: { 50: '#E8EAF6', 100: '#C5CAE9', 200: '#9FA8DA', 300: '#7986CB', 400: '#5C6BC0', 500: '#3F51B5', 600: '#303F9F', 700: '#283593', 800: '#1A237E', 900: '#0D1342' },
        accent: { cyan: '#00BCD4', teal: '#009688', gold: '#FFD700', coral: '#FF6B6B' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
