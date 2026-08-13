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

import { useTimelineFill } from './useTimelineFill'

function Harness() {
  const ref = useTimelineFill<HTMLDivElement>()
  return (
    <div data-testid="parent">
      <div ref={ref}>
        <p>content</p>
      </div>
    </div>
  )
}

describe('useTimelineFill', () => {
  beforeEach(() => {
    spies.gsapContext.mockClear()
    spies.gsapFromTo.mockClear()
    spies.ctxRevert.mockClear()
    spies.prefersReducedMotion.mockReset()
    spies.prefersReducedMotion.mockReturnValue(false)
  })
  afterEach(() => vi.clearAllMocks())

  it('scrubs the spine scaleY 0→1 across the section on mount', () => {
    const { unmount, getByTestId } = render(<Harness />)
    expect(spies.gsapContext).toHaveBeenCalledTimes(1)
    expect(spies.gsapFromTo).toHaveBeenCalledTimes(1)
    const [, fromVars, toVars] = spies.gsapFromTo.mock.calls[0]
    expect(fromVars).toMatchObject({ scaleY: 0 })
    expect(toVars).toMatchObject({ scaleY: 1, ease: 'none', transformOrigin: 'top' })
    expect(toVars.scrollTrigger).toMatchObject({
      scrub: true,
      start: 'top 50%',
      end: 'bottom 50%',
    })
    // Trigger on the stable parent (the fill is transformed, so it can't be its own trigger).
    expect(toVars.scrollTrigger.trigger).toBe(getByTestId('parent'))
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
