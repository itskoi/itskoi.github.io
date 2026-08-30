import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

export interface UseScrollRevealOptions {
  selector?: string
  stagger?: number
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: UseScrollRevealOptions = {},
) {
  const ref = useRef<T>(null)
  const { selector = '[data-reveal]', stagger = 0.08 } = options

  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return

    // Same masked line-rise grammar as the hero intro (see useHeroIntro).
    const ctx = gsap.context(() => {
      gsap.from(selector, {
        yPercent: 40,
        clipPath: 'inset(0% 0% 100% 0%)',
        clearProps: 'clipPath',
        duration: 0.6,
        stagger,
        ease: 'expo.out',
        scrollTrigger: { trigger: root, start: 'top 80%' },
      })
    }, root)

    return () => ctx.revert()
  }, [selector, stagger])

  return ref
}
