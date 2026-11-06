import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { type Connect, defineConfig } from 'vite'

// Vite's SPA fallback serves the portfolio for `/pomo`; GitHub Pages redirects it, so match that.
const pomoRedirect: Connect.NextHandleFunction = (req, res, next) => {
  if (req.url?.split('?')[0] !== '/pomo') return next()
  res.writeHead(301, { Location: '/pomo/' }).end()
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pomo-redirect',
      configureServer: (server) => void server.middlewares.use(pomoRedirect),
      configurePreviewServer: (server) => void server.middlewares.use(pomoRedirect),
    },
  ],
  // GitHub Pages serves this from the repo root. For a project page at
  // https://<user>.github.io/<repo>/, set this to '/<repo>/' instead.
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        pomo: fileURLToPath(new URL('./pomo/index.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
