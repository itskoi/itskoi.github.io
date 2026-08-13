import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

export interface UseScrollRevealOptions {
  selector?: string
  stagger?: number
  y?: number
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: UseScrollRevealOptions = {},
) {
  const ref = useRef<T>(null)
  const { selector = '[data-reveal]', stagger = 0.08, y = 20 } = options

  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.from(selector, {
        y,
        opacity: 0,
        duration: 0.6,
        stagger,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 80%' },
      })
    }, root)

    return () => ctx.revert()
  }, [selector, stagger, y])

  return ref
}
