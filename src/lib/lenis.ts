import Lenis from 'lenis'
import { gsap } from './gsap'

export interface SmoothScroll {
  lenis: Lenis
  destroy: () => void
}

// A title-only project is short, so the wheel slows there to hold its illustration on stage.
const COLLAPSED_PROJECT_WHEEL = 0.25

let activeLenis: Lenis | null = null

function bandIsOnCollapsedProject(): boolean {
  const band = window.innerHeight / 2
  return Array.from(document.querySelectorAll('details:not([open])')).some((details) => {
    const project = details.parentElement?.getBoundingClientRect()
    return project !== undefined && project.top <= band && project.bottom > band
  })
}

export function createSmoothScroll(): SmoothScroll {
  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    virtualScroll: (data) => {
      if (bandIsOnCollapsedProject()) data.deltaY *= COLLAPSED_PROJECT_WHEEL
      return true
    },
  })

  // GSAP's ticker is the single RAF host — it calls lenis.raf with delta
  // seconds, which Lenis wants in milliseconds.
  const raf = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  activeLenis = lenis

  return {
    lenis,
    destroy: () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      activeLenis = null
    },
  }
}

export function scrollTo(target: string | number | HTMLElement): void {
  activeLenis?.scrollTo(target)
}
