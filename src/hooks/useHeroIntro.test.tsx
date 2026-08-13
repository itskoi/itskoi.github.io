import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const spies = vi.hoisted(() => {
  const ctxRevert = vi.fn()
  const gsapContext = vi.fn((fn: () => void) => {
    fn()
    return { revert: ctxRevert }
  })
  const timelineFrom = vi.fn()
  const gsapTimeline = vi.fn(() => ({ from: timelineFrom }))
  const prefersReducedMotion = vi.fn(() => false)
  return { ctxRevert, gsapContext, gsapTimeline, timelineFrom, prefersReducedMotion }
})

vi.mock('@/lib/gsap', () => ({
  gsap: { context: spies.gsapContext, timeline: spies.gsapTimeline },
  prefersReducedMotion: spies.prefersReducedMotion,
}))

import { useHeroIntro } from './useHeroIntro'

function Harness() {
  const ref = useHeroIntro<HTMLDivElement>()
  return (
    <div ref={ref}>
      <h1 data-intro>name</h1>
      <p data-intro>role</p>
    </div>
  )
}

describe('useHeroIntro', () => {
  beforeEach(() => {
    spies.gsapContext.mockClear()
    spies.gsapTimeline.mockClear()
    spies.timelineFrom.mockClear()
    spies.ctxRevert.mockClear()
    spies.prefersReducedMotion.mockReset()
    spies.prefersReducedMotion.mockReturnValue(false)
  })
  afterEach(() => vi.clearAllMocks())

  it('plays a staggered intro timeline on mount', () => {
    const { unmount } = render(<Harness />)
    expect(spies.gsapTimeline).toHaveBeenCalledTimes(1)
    expect(spies.timelineFrom).toHaveBeenCalledWith(
      '[data-intro]',
      expect.objectContaining({ stagger: 0.15, opacity: 0 }),
    )
    unmount()
    expect(spies.ctxRevert).toHaveBeenCalledTimes(1)
  })

  it('does not animate under reduced motion', () => {
    spies.prefersReducedMotion.mockReturnValue(true)
    render(<Harness />)
    expect(spies.gsapTimeline).not.toHaveBeenCalled()
    expect(spies.gsapContext).not.toHaveBeenCalled()
  })
})
