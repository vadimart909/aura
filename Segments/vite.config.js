import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/segments/',
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(import.meta.dirname, '../shared'),
    },
  },
  server: {
    fs: {
      // Общий список атрибутов лежит выше корня приложения — в ../shared
      allow: [path.resolve(import.meta.dirname, '..')],
    },
    proxy: {
      // Proxy cross-MFE navigation to Scenario dev-server
      '/aura': {
        target: 'http://localhost:5176',
        changeOrigin: true,
      },
    },
  },
})
