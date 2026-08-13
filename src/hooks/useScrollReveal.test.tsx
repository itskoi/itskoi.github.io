import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const spies = vi.hoisted(() => {
  const ctxRevert = vi.fn()
  const gsapContext = vi.fn((fn: () => void) => {
    fn()
    return { revert: ctxRevert }
  })
  const gsapFrom = vi.fn()
  const prefersReducedMotion = vi.fn(() => false)
  return { ctxRevert, gsapContext, gsapFrom, prefersReducedMotion }
})

vi.mock('@/lib/gsap', () => ({
  gsap: { context: spies.gsapContext, from: spies.gsapFrom },
  prefersReducedMotion: spies.prefersReducedMotion,
}))

import { useScrollReveal } from './useScrollReveal'

function Harness() {
  const ref = useScrollReveal<HTMLDivElement>()
  return (
    <div ref={ref}>
      <span data-reveal>one</span>
      <span data-reveal>two</span>
    </div>
  )
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    spies.gsapContext.mockClear()
    spies.gsapFrom.mockClear()
    spies.ctxRevert.mockClear()
    spies.prefersReducedMotion.mockReset()
    spies.prefersReducedMotion.mockReturnValue(false)
  })
  afterEach(() => vi.clearAllMocks())

  it('reveals [data-reveal] children on mount', () => {
    const { unmount } = render(<Harness />)
    expect(spies.gsapContext).toHaveBeenCalledTimes(1)
    expect(spies.gsapFrom).toHaveBeenCalledWith(
      '[data-reveal]',
      expect.objectContaining({ stagger: 0.08, opacity: 0 }),
    )
    unmount()
    expect(spies.ctxRevert).toHaveBeenCalledTimes(1)
  })

  it('does not animate under reduced motion', () => {
    spies.prefersReducedMotion.mockReturnValue(true)
    render(<Harness />)
    expect(spies.gsapFrom).not.toHaveBeenCalled()
    expect(spies.gsapContext).not.toHaveBeenCalled()
  })
})
