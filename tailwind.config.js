// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // Configuración crucial para que Tailwind escanee tus componentes de React
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}