import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Usa la variabile d'ambiente se disponibile, altrimenti localhost
        target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
})
