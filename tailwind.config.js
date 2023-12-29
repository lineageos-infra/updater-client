/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        'brand-light': '#cce8e9',
        'brand-dark': '#324b4c',
        'brand-primary': '#167c80'
      }
    }
  },
  plugins: []
}
