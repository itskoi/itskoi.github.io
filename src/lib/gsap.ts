import { gsap } from 'gsap'

// GSAP is ticker-only in this codebase: its ticker drives Lenis's RAF (see
// src/lib/lenis.ts). Nothing animates through GSAP itself — the canvas scenes
// own all motion (specs/binary-star-background, specs/black-hole-background).

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { gsap }
