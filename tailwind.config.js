/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {
    colors: {
      prime: "#FE8F01",
      secon: "#FFF5E9",
    },
    fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-bold": ["Inter_700Bold"],
        poppins: ['Poppins_400Regular'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
        luxurious: ['LuxuriousScript'],
      },
  } },
  plugins: [],
};

