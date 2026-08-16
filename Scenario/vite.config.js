import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const designSystemRoot = path.resolve(__dirname, '../prototype/design-system')

// https://vite.dev/config/
export default defineConfig({
  base: '/aura/',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@ds': path.join(designSystemRoot, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: 'localhost',
    fs: {
      allow: [path.resolve(__dirname, '..'), designSystemRoot],
    },
    hmr: {
      port: 24680,
    },
  },
})
