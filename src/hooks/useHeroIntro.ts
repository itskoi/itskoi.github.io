import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

export function useHeroIntro<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.timeline().from('[data-intro]', {
        y: 24,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power3.out',
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return ref
}
