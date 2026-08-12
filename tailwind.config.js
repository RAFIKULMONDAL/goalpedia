/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        red: {
          primary: "#cc0000",
          dark: "#a80000",
          light: "rgba(204,0,0,0.1)",
        },
        charcoal: {
          900: "#0f0f0f",
          800: "#1a1a1a",
          700: "#222222",
          600: "#2a2a2a",
          500: "#333333",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
