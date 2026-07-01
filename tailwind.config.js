/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        offwhite: {
          50: '#FDFCF9',
          100: '#F9F6F0',
          200: '#F4EFE5',
          300: '#EDE5D5',
        },
        moss: {
          50:  '#EEF2EB',
          100: '#D4DFD0',
          200: '#9DB59A',
          300: '#6A8E66',
          400: '#4A6E45',
          500: '#3A5232',
          600: '#2D4027',
          700: '#1F2E1B',
        },
        gold: {
          100: '#EFE0B0',
          200: '#D9C07A',
          300: '#C4A45A',
          400: '#B8952A',
          500: '#9E7D1A',
          600: '#7A5F10',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
