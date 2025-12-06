import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Force VITE_API_URL to be empty string in production build
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('')
  },
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5184',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../Indiaborn.Api/wwwroot',
    emptyOutDir: true
  }
})

