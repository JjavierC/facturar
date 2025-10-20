// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 💡 AÑADE ESTA LÍNEA PARA RESOLVER LA PANTALLA BLANCA EN NETLIFY
  base: './', 
});