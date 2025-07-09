export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',   // Extra small devices (phones)
        'sm': '640px',   // Small devices (large phones, small tablets)
        'md': '768px',   // Medium devices (tablets)
        'lg': '1024px',  // Large devices (laptops/desktops)
        'xl': '1280px',  // Extra large devices (large desktops)
        '2xl': '1536px', // 2XL screens
      },
    },
  },
  plugins: [],
}
