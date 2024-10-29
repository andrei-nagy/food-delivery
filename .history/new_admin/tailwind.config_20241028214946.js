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
    },
  },
  plugins: [],
}