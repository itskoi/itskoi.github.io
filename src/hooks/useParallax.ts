import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

export interface UseParallaxOptions {
  amount?: number
}

export function useParallax<T extends HTMLElement = HTMLElement>(options: UseParallaxOptions = {}) {
  const ref = useRef<T>(null)
  const { amount = 60 } = options

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -amount / 4 },
        {
          yPercent: amount / 4,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [amount])

  return ref
}
