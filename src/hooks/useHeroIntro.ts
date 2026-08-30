import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

export function useHeroIntro<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return

    // Masked line-rise: each line slides up out of its own clip. `clearProps`
    // drops the clip when done so descenders are never shaved at the box edge.
    const ctx = gsap.context(() => {
      gsap.timeline().from('[data-intro]', {
        yPercent: 60,
        clipPath: 'inset(0% 0% 100% 0%)',
        clearProps: 'clipPath',
        stagger: 0.08,
        duration: 0.7,
        ease: 'expo.out',
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return ref
}
