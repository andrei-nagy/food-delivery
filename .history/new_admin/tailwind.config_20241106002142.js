/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Activează suportul pentru dark mode
  theme: {
    extend: {
      inset: {
        '65': '65%', // Adaugă o clasă de top la 65%
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        'dancing-script': ['Dancing Script', 'cursive'],
        'great-vibes': ['Great Vibes', 'cursive'],
        'pacifico': ['Pacifico', 'cursive'],
        'satisfy': ['Satisfy', 'cursive'],
        'tangerine': ['Tangerine', 'cursive'],
    },
    },
  },
  plugins: [],
}