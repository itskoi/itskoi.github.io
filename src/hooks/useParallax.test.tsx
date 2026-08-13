import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const spies = vi.hoisted(() => {
  const ctxRevert = vi.fn()
  const gsapContext = vi.fn((fn: () => void) => {
    fn()
    return { revert: ctxRevert }
  })
  const gsapFromTo = vi.fn()
  const prefersReducedMotion = vi.fn(() => false)
  return { ctxRevert, gsapContext, gsapFromTo, prefersReducedMotion }
})

vi.mock('@/lib/gsap', () => ({
  gsap: { context: spies.gsapContext, fromTo: spies.gsapFromTo },
  prefersReducedMotion: spies.prefersReducedMotion,
}))

import { useParallax } from './useParallax'

function Harness() {
  const ref = useParallax<HTMLDivElement>({ amount: 80 })
  return (
    <div ref={ref}>
      <p>content</p>
    </div>
  )
}

describe('useParallax', () => {
  beforeEach(() => {
    spies.gsapContext.mockClear()
    spies.gsapFromTo.mockClear()
    spies.ctxRevert.mockClear()
    spies.prefersReducedMotion.mockReset()
    spies.prefersReducedMotion.mockReturnValue(false)
  })
  afterEach(() => vi.clearAllMocks())

  it('registers a scrubbed parallax on mount', () => {
    const { unmount } = render(<Harness />)
    expect(spies.gsapContext).toHaveBeenCalledTimes(1)
    expect(spies.gsapFromTo).toHaveBeenCalledTimes(1)
    const [, , vars] = spies.gsapFromTo.mock.calls[0]
    expect(vars).toMatchObject({ ease: 'none' })
    expect(vars.scrollTrigger).toMatchObject({ scrub: true })
    unmount()
    expect(spies.ctxRevert).toHaveBeenCalledTimes(1)
  })

  it('does not animate under reduced motion', () => {
    spies.prefersReducedMotion.mockReturnValue(true)
    render(<Harness />)
    expect(spies.gsapFromTo).not.toHaveBeenCalled()
    expect(spies.gsapContext).not.toHaveBeenCalled()
  })
})
