export default {
  content: ['./index.html', './App.tsx', './constants.ts', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Quicksand', 'sans-serif'], display: ['Nunito', 'sans-serif'] },
      colors: { 'cute-pink': '#FFD1DC', 'cute-blue': '#B4E4FF', 'cute-yellow': '#FDFD96', 'cute-purple': '#E6CEFA', 'cute-mint': '#CBF1D3' },
    },
  },
};
