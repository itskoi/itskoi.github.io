import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { gsap, prefersReducedMotion } from './gsap'

const source = readFileSync(resolve(process.cwd(), 'src/lib/gsap.ts'), 'utf8')

describe('gsap module', () => {
  it('exports gsap (ticker-only)', () => {
    expect(gsap).toBeDefined()
    expect(gsap.ticker).toBeDefined()
  })

  it('no longer registers ScrollTrigger (it left with the reveal hooks)', () => {
    expect(source).not.toMatch(/ScrollTrigger/)
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
