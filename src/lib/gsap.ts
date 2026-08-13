import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function ensureGsapRegistered(): void {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

// Register eagerly on import. React runs child effects before the parent's, so the
// Lenis handshake in `createSmoothScroll` (an App effect) registers too late for the
// scroll-triggered hooks in child sections — their `scrollTrigger` config would be
// ignored and the tween would play instantly. This runs before any of those effects.
ensureGsapRegistered()

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { gsap, ScrollTrigger }
