// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/gemini': {
        target: 'https://gemini-service-rish.onrender.com/api/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gemini/, ''), // Mantenha a rota da API
      },
      '/nao': {
        target: 'https://nao-robot-service.onrender.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nao/, ''), // Mantenha a rota da API
      },
    },
  },
});