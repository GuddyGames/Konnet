export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        gold: '#F59E0B',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        heartPop: 'heartPop 0.8s ease forwards',
        slideUp: 'slideUp 0.25s ease',
        fadeIn: 'fadeIn 0.2s ease',
        fadeSlideIn: 'fadeSlideIn 0.25s ease',
      },
      keyframes: {
        heartPop: {
          '0%': { opacity: 0, transform: 'scale(0.5)' },
          '15%': { opacity: 1, transform: 'scale(1.3)' },
          '30%': { transform: 'scale(1)' },
          '80%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeSlideIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
