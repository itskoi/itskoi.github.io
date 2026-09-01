import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ACTIVE_BAND, useSectionActive } from './useSectionActive'

function stubIntersectionObserver() {
  const observer = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
  const observerClass = vi.fn(
    (_callback: IntersectionObserverCallback, _init?: IntersectionObserverInit) => observer,
  )
  vi.stubGlobal('IntersectionObserver', observerClass)
  return { observerClass, observer }
}

const fire = (
  observerClass: ReturnType<typeof stubIntersectionObserver>['observerClass'],
  isIntersecting: boolean,
) => {
  const callback = observerClass.mock.calls[0]?.[0]
  const entry = { isIntersecting } as IntersectionObserverEntry
  act(() => {
    callback?.([entry], undefined as unknown as IntersectionObserver)
  })
}

describe('useSectionActive', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('observes the section against the shared active band and starts inactive', () => {
    document.body.innerHTML = '<section id="experience"></section>'
    const { observerClass, observer } = stubIntersectionObserver()
    const { result } = renderHook(() => useSectionActive('experience'))

    expect(observerClass).toHaveBeenCalledTimes(1)
    expect(observerClass.mock.calls[0][1]?.rootMargin).toBe(ACTIVE_BAND)
    expect(observer.observe).toHaveBeenCalledWith(document.getElementById('experience'))
    expect(result.current).toBe(false)
  })

  it('activates when its section crosses the band and deactivates when it leaves', () => {
    document.body.innerHTML = '<section id="experience"></section>'
    const { observerClass } = stubIntersectionObserver()
    const { result } = renderHook(() => useSectionActive('experience'))

    fire(observerClass, true)
    expect(result.current).toBe(true)

    fire(observerClass, false)
    expect(result.current).toBe(false)
  })

  it('never activates where IntersectionObserver does not exist (jsdom)', () => {
    document.body.innerHTML = '<section id="experience"></section>'
    vi.stubGlobal('IntersectionObserver', undefined)
    const { result } = renderHook(() => useSectionActive('experience'))
    expect(result.current).toBe(false)
  })

  it('creates no observer when the section id is missing', () => {
    const { observerClass } = stubIntersectionObserver()
    renderHook(() => useSectionActive('nowhere'))
    expect(observerClass).not.toHaveBeenCalled()
  })

  it('disconnects its observer on unmount', () => {
    document.body.innerHTML = '<section id="experience"></section>'
    const { observer } = stubIntersectionObserver()
    const { unmount } = renderHook(() => useSectionActive('experience'))
    unmount()
    expect(observer.disconnect).toHaveBeenCalledTimes(1)
  })
})
