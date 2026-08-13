import Lenis from 'lenis'
import { ensureGsapRegistered, gsap, ScrollTrigger } from './gsap'

export interface SmoothScroll {
  lenis: Lenis
  destroy: () => void
}

let activeLenis: Lenis | null = null

export function createSmoothScroll(): SmoothScroll {
  ensureGsapRegistered()

  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

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
