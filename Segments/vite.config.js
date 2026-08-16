import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/segments/',
  plugins: [react()],
  server: {
    proxy: {
      // Proxy cross-MFE navigation to Scenario dev-server
      '/aura': {
        target: 'http://localhost:5176',
        changeOrigin: true,
      },
    },
  },
})
