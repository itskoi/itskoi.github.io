import { beforeEach, describe, expect, it, vi } from 'vitest'

const lenisScrollTo = vi.fn()
const on = vi.fn()
const destroy = vi.fn()
const raf = vi.fn()

vi.mock('lenis', () => ({
  default: vi.fn(() => ({ on, raf, scrollTo: lenisScrollTo, destroy })),
}))

import { createSmoothScroll, scrollTo } from './lenis'

describe('lenis scroll plumbing', () => {
  beforeEach(() => {
    lenisScrollTo.mockClear()
    on.mockClear()
    destroy.mockClear()
  })

  it('scrollTo delegates to the active Lenis instance', () => {
    const { lenis } = createSmoothScroll()
    scrollTo('#experience')
    expect(lenis.scrollTo).toHaveBeenCalledWith('#experience')
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
  })

  it('scrollTo is a no-op after destroy (active instance cleared)', () => {
    const { destroy: teardown } = createSmoothScroll()
    teardown()
    expect(() => scrollTo('#education')).not.toThrow()
  })
})
