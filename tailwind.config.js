/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        wakie: {
          bg: '#171717', // Chinese Black
          primary: '#3A05A9', // Neon Blue
          secondary: '#32325A', // Jacarta
          accent: '#62A978', // Shinny Shamrock
          gradientStart: '#82AEE1',
          gradientEnd: '#7971D1',
          card: '#232323', // Slightly lighter than bg for cards
        },
      },
    },
  },
  plugins: [],
}
