import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const API_TARGET = 'https://solution-a9gthddfa2b4e7hx.canadacentral-01.azurewebsites.net'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Geliştirme: /api istekleri backend'e yönlendirilir (CORS bypass)
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})
