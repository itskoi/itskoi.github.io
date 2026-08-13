import { afterEach, describe, expect, it, vi } from 'vitest'
import { gsap, prefersReducedMotion, ScrollTrigger } from './gsap'

describe('gsap module', () => {
  it('exports gsap and ScrollTrigger', () => {
    expect(gsap).toBeDefined()
    expect(ScrollTrigger).toBeDefined()
  })

  describe('prefersReducedMotion', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('returns false when the media query does not match', () => {
      vi.stubGlobal(
        'matchMedia',
        (query: string): MediaQueryList => ({ matches: false, media: query }) as MediaQueryList,
      )
      expect(prefersReducedMotion()).toBe(false)
    })

    it('returns true when the user prefers reduced motion', () => {
      vi.stubGlobal(
        'matchMedia',
        (query: string): MediaQueryList => ({ matches: true, media: query }) as MediaQueryList,
      )
      expect(prefersReducedMotion()).toBe(true)
    })
  })
})
