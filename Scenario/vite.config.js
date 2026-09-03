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
      '@shared': path.resolve(__dirname, '../shared'),
      // Общая шапка лежит в ../shared, а node_modules там нет: корневого
      // package.json в репозитории тоже нет, зависимости стоят внутри каждого
      // приложения. Дев-сервер такие голые импорты дотягивает от корня
      // приложения, а прод-сборка (rolldown) — нет, поэтому адресуем явно.
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: 'localhost',
    fs: {
      allow: [path.resolve(__dirname, '..'), designSystemRoot],
    },
    ws: {
      // Свой порт под HMR: приложения делят один HTTP-порт, но вебсокеты — нет.
      // Раньше это был `hmr.port`, в Vite 8 он объявлен устаревшим.
      port: 24680,
    },
  },
})
