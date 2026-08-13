import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/**
 * Scrubs a vertical "fill" element's `scaleY` from 0 → 1 as the section scrolls
 * through the viewport — the spine of the Experience timeline drawing itself in.
 * Mirrors `useParallax` (scrubbed `fromTo`, `ease: 'none'`, `gsap.context` + revert).
 * Reduced motion → no animation (the element keeps its CSS default).
 */
export function useTimelineFill<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    // Trigger on the fill's parent (the stable timeline), not the fill itself — the
    // fill is the element being scaleY-transformed, so using it as the trigger would
    // feed its changing bbox back into the scroll math and collapse the scrub range.
    const trigger = el.parentElement ?? el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger, start: 'top 50%', end: 'bottom 50%', scrub: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [])

  return ref
}
