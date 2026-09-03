import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const designSystemRoot = path.resolve(import.meta.dirname, '../prototype/design-system')

// https://vite.dev/config/
export default defineConfig({
  // Сегменты — часть Ауры и живут под её адресом: и в деве, и на Pages оба
  // сервиса отдаются с одного origin (см. dev-server.mjs в корне репозитория).
  base: '/aura/segments/',
  plugins: [react()],
  resolve: {
    alias: {
      '@ds': path.join(designSystemRoot, 'src'),
      '@shared': path.resolve(import.meta.dirname, '../shared'),
      // Общая шапка лежит в ../shared, а node_modules там нет: корневого
      // package.json в репозитории тоже нет, зависимости стоят внутри каждого
      // приложения. Дев-сервер такие голые импорты дотягивает от корня
      // приложения, а прод-сборка (rolldown) — нет, поэтому адресуем явно.
      react: path.resolve(import.meta.dirname, 'node_modules/react'),
      'react-dom': path.resolve(import.meta.dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(import.meta.dirname, 'node_modules/react-router-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    fs: {
      // Общий список атрибутов лежит выше корня приложения — в ../shared,
      // общая шапка — там же, а её стили и компонент приезжают из ДС.
      allow: [path.resolve(import.meta.dirname, '..'), designSystemRoot],
    },
    ws: {
      // Свой порт под HMR: приложения делят один HTTP-порт, но вебсокеты — нет.
      // Значение не должно совпадать ни с портом HTTP-сервера, ни с 24680
      // (его занимают Сценарии).
      port: 24681,
    },
  },
})
