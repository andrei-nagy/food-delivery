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
          "linear-gradient(135deg, rgba(255, 183, 94, 1) 0%, rgba(255, 94, 0, 1) 49%, rgba(255, 165, 0, 1) 50%)",
      },
      boxShadow: {
        navbar:
          "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
      },
    },
  },
  plugins: [],
};
