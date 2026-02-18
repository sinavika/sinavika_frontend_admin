import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const DEFAULT_API_ORIGIN = 'https://solution-a9gthddfa2b4e7hx.canadacentral-01.azurewebsites.net'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = env.VITE_API_BASE_URL || DEFAULT_API_ORIGIN

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // Geliştirme: /api istekleri .env'deki VITE_API_BASE_URL'e yönlendirilir (CORS bypass)
        '/api': {
          target: apiOrigin.replace(/\/api\/?$/, ''),
          changeOrigin: true,
        },
      },
    },
  }
})
