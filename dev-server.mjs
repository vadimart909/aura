/**
 * Единый dev-сервер репозитория: оба приложения Ауры на ОДНОМ порту.
 *
 *   http://localhost:5173/aura/           → Сценарии
 *   http://localhost:5173/aura/segments/  → Сегменты
 *
 * Так дев повторяет прод: на GitHub Pages оба приложения лежат в одном
 * артефакте под одним origin, и ссылки в шапке работают без смены порта.
 *
 * Why a hand-rolled HTTP server instead of Vite's own: Cursor / VS Code
 * port-forwarding opens TCP connections to the dev server and then sits idle
 * without sending any HTTP request.  With Vite's built-in server these zombie
 * connections exhaust the connection pool and block every later browser
 * request (infinite loading).  Owning the server lets us reap them.
 *
 * Usage:  node dev-server.mjs        (PORT / HOST переопределяют умолчания)
 */

import http from 'node:http'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const REPO_ROOT = import.meta.dirname
const PORT = Number(process.env.PORT) || 5173
const HOST = process.env.HOST || 'localhost'

const SCENARIO_BASE = '/aura/'
const SEGMENTS_BASE = '/aura/segments/'

/**
 * Корневого package.json и workspace в репозитории нет: у каждого приложения
 * свой node_modules и своя версия Vite. Поэтому Vite грузим ИЗ ПАПКИ
 * приложения — иначе конфиг одного поехал бы на вайте другого.
 */
async function loadVite(appRoot) {
  const require = createRequire(path.join(appRoot, 'noop.cjs'))
  let entry
  try {
    entry = require.resolve('vite')
  } catch {
    throw new Error(
      `vite не установлен в ${appRoot} — выполни: npm --prefix ${path.basename(appRoot)} install`,
    )
  }
  return import(pathToFileURL(entry).href)
}

async function createApp(dir, expectedBase) {
  const root = path.join(REPO_ROOT, dir)
  const { createServer } = await loadVite(root)
  const vite = await createServer({
    root, // vite.config.js подхватывается из root
    appType: 'spa',
    server: {
      middlewareMode: true,
      // Vite зашивает `server.port` в клиент; держим его равным порту, который
      // слушает наш HTTP-сервер.
      port: PORT,
    },
  })
  // Диспетчеризация ниже завязана на base — пусть расхождение падает сразу и
  // с внятным текстом, а не оборачивается пустыми страницами.
  if (vite.config.base !== expectedBase) {
    throw new Error(`${dir}/vite.config.js: base = "${vite.config.base}", ожидался "${expectedBase}"`)
  }
  return vite
}

function redirect(req, res, target, pathname) {
  res.writeHead(302, { Location: target + (req.url || '').slice(pathname.length) })
  res.end()
}

async function start() {
  const scenario = await createApp('Scenario', SCENARIO_BASE)
  const segments = await createApp('Segments', SEGMENTS_BASE)

  const server = http.createServer((req, res) => {
    const pathname = (req.url || '/').split('?')[0]

    // Порядок проверок важен: '/aura/segments/' — строгий подпуть '/aura/',
    // поэтому длинный префикс идёт ПЕРВЫМ. Иначе все страницы Сегментов
    // отвечал бы SPA-фолбэк Сценариев.
    //
    // Dispatch has to be explicit: each Vite middleware chain ends with
    // vite404Middleware, which takes no `next` and always answers itself.
    // Chaining the two chains is therefore impossible — whichever runs first
    // would swallow every request.
    //
    // `req.url` намеренно не переписываем: каждый Vite сам снимает свой base,
    // так что и /@fs, и /@vite/client, и SPA-фолбэк остаются внутри своего
    // приложения.
    if (pathname === '/aura/segments') return redirect(req, res, SEGMENTS_BASE, pathname)
    if (pathname.startsWith(SEGMENTS_BASE)) return segments.middlewares(req, res)
    if (pathname === '/aura') return redirect(req, res, SCENARIO_BASE, pathname)
    if (pathname.startsWith(SCENARIO_BASE)) return scenario.middlewares(req, res)

    // '/' и всё прочее — на точку входа прототипа.
    res.writeHead(302, { Location: SCENARIO_BASE })
    res.end()
  })

  // ---- Zombie connection reaper ----
  const sockets = new Set()

  // HMR-вебсокеты живут на собственных http-серверах Vite (порты 24680/24681)
  // и в этот Set не попадают. Метка — страховка на будущее: если кто-то
  // переведёт HMR на этот же сервер через `server.ws.server`, апгрейженный
  // сокет попадёт в развёртку и та будет рвать его каждые 2 секунды.
  server.on('upgrade', (_req, socket) => { socket.__isWebSocket = true })

  server.on('connection', (socket) => {
    socket.__lastActivity = Date.now()
    sockets.add(socket)

    // 'data' fires at the TCP level, before Node HTTP parser,
    // so it reliably tracks real traffic.
    socket.on('data', () => { socket.__lastActivity = Date.now() })
    socket.once('close', () => sockets.delete(socket))
  })

  // Every second, kill sockets idle for > 2 s
  setInterval(() => {
    const now = Date.now()
    for (const socket of sockets) {
      if (socket.__isWebSocket) continue
      if (!socket.destroyed && now - socket.__lastActivity > 2000) {
        socket.destroy()
        sockets.delete(socket)
      }
    }
  }, 1000).unref()

  // Aggressive server-level timeouts
  server.keepAliveTimeout = 1000
  server.headersTimeout = 3000
  server.requestTimeout = 10000

  server.listen(PORT, HOST, () => {
    console.log()
    console.log(`  Сценарии:  http://${HOST}:${PORT}${SCENARIO_BASE}`)
    console.log(`  Сегменты:  http://${HOST}:${PORT}${SEGMENTS_BASE}`)
    console.log(`  (zombie-connection reaper active)`)
    console.log()
  })

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down...')
    for (const s of sockets) { try { s.destroy() } catch {} }
    server.close()
    await Promise.allSettled([scenario.close(), segments.close()])
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error('Failed to start dev server:', err)
  process.exit(1)
})
