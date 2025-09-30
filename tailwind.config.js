/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.jsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "roboto-regular": ["Roboto_400Regular"],
        "roboto-medium": ["Roboto_500Medium"],
        "roboto-semibold": ["Roboto_600SemiBold"],
        "roboto-bold": ["Roboto_700Bold"],
        agbalumo: ["Agbalumo_400Regular"],
      },
    },
  },
  plugins: [],
};
