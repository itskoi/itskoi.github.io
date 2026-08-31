import Lenis from 'lenis'
import { gsap } from './gsap'

export interface SmoothScroll {
  lenis: Lenis
  destroy: () => void
}

let activeLenis: Lenis | null = null

export function createSmoothScroll(): SmoothScroll {
  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
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
