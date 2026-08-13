import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { initTheme } from '@/lib/theme'
// Lenis's own CSS is required: it sets html.lenis { height: auto }, which lets the
// document scroll its full content height. Without it the page can get stuck mid-scroll.
import 'lenis/dist/lenis.css'
import '@/styles/fonts.css'
import '@/styles/global.css'

// Resolve the theme before first paint so the correct tokens apply immediately
// (no flash of the wrong mode). Leaves data-theme unset when there is no stored
// choice, letting the prefers-color-scheme CSS path own first paint.
initTheme()

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
