/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "source-sans": ["Source Sans 3", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        "errie-black": "#252525",
        "risd-blue": "#5b5af7",
        "cadet-gray": "#919eab",
        jet: "#2c2c2c",
      },
      backgroundImage: {
        "grad-theme-135":
        // "linear-gradient(135deg, rgba(255, 195, 115, 0.3) 0%, rgba(255, 140, 75, 0.5) 49%, rgba(255, 175, 95, 0.3) 100%)"

      },
      
      
      
      boxShadow: {
        navbar:
          "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
      },
    },
  },
  plugins: [],
};
