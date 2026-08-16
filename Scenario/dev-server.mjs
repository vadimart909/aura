/**
 * Custom dev server that wraps Vite in middleware mode.
 *
 * Why: Cursor / VS Code port-forwarding opens TCP connections to the dev
 * server and then sits idle without sending any HTTP request.  With Vite's
 * built-in HTTP server these zombie connections exhaust the connection pool
 * and block all subsequent browser requests (infinite loading).
 *
 * This script creates its own Node HTTP server with a 2-second idle-socket
 * reaper, then plugs Vite into it as middleware.  Zombie connections are
 * killed before they can do any damage.
 *
 * Usage:  node dev-server.mjs
 */

import { createServer as createViteServer } from 'vite'
import http from 'node:http'

const PORT = Number(process.env.PORT) || 5173
const HOST = process.env.HOST || 'localhost'

async function start() {
  // Create Vite in middleware mode — it does NOT create its own HTTP server
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })

  // Create our own HTTP server with full socket control
  const server = http.createServer((req, res) => {
    vite.middlewares(req, res)
  })

  // ---- Zombie connection reaper ----
  const sockets = new Set()

  server.on('connection', (socket) => {
    socket.__lastActivity = Date.now()
    sockets.add(socket)

    // 'data' fires at the TCP level, before Node HTTP parser,
    // so it reliably tracks real traffic.
    const onData = () => { socket.__lastActivity = Date.now() }
    socket.on('data', onData)
    socket.once('close', () => sockets.delete(socket))
  })

  // Every second, kill sockets idle for > 2 s
  setInterval(() => {
    const now = Date.now()
    for (const socket of sockets) {
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

  // ---- WebSocket upgrade for HMR ----
  server.on('upgrade', (req, socket, head) => {
    if (vite.ws && typeof vite.ws.handleUpgrade === 'function') {
      vite.ws.handleUpgrade(req, socket, head)
    }
  })

  server.listen(PORT, HOST, () => {
    console.log()
    console.log(`  Dev server ready:  http://${HOST}:${PORT}/aura/`)
    console.log(`  (zombie-connection reaper active)`)
    console.log()
  })

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down...')
    for (const s of sockets) { try { s.destroy() } catch {} }
    server.close()
    vite.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error('Failed to start dev server:', err)
  process.exit(1)
})
