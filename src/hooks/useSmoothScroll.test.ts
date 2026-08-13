import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { destroy, createSmoothScroll } = vi.hoisted(() => {
  const destroy = vi.fn()
  const createSmoothScroll = vi.fn(() => ({ lenis: {}, destroy }))
  return { destroy, createSmoothScroll }
})

vi.mock('@/lib/lenis', () => ({ createSmoothScroll }))

import { useSmoothScroll } from './useSmoothScroll'

describe('useSmoothScroll', () => {
  beforeEach(() => {
    createSmoothScroll.mockClear()
    destroy.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates a smooth scroll instance on mount', () => {
    renderHook(() => useSmoothScroll())
    expect(createSmoothScroll).toHaveBeenCalledTimes(1)
  })

  it('destroys the smooth scroll instance on unmount', () => {
    const { unmount } = renderHook(() => useSmoothScroll())
    unmount()
    expect(destroy).toHaveBeenCalledTimes(1)
  })
})
