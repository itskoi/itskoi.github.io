import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ACTIVE_BAND, useActiveId, useSectionActive } from './useSectionActive'

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

describe('useActiveId', () => {
  const IDS = ['a', 'b'] as const

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('observes every id against the shared band and starts with none', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'
    const { observerClass, observer } = stubIntersectionObserver()
    const { result } = renderHook(() => useActiveId(IDS))

    expect(observerClass.mock.calls[0][1]?.rootMargin).toBe(ACTIVE_BAND)
    expect(observer.observe).toHaveBeenCalledTimes(2)
    expect(result.current).toBeUndefined()
  })

  it('keeps the last id that crossed the band while the band sits in a gap', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'
    const { observerClass } = stubIntersectionObserver()
    const { result } = renderHook(() => useActiveId(IDS))
    const callback = observerClass.mock.calls[0]?.[0]
    const cross = (id: string, isIntersecting: boolean) =>
      act(() => {
        callback?.(
          [
            {
              isIntersecting,
              target: document.getElementById(id),
            } as unknown as IntersectionObserverEntry,
          ],
          undefined as unknown as IntersectionObserver,
        )
      })

    cross('a', true)
    expect(result.current).toBe('a')
    cross('a', false)
    expect(result.current).toBe('a')
    cross('b', true)
    expect(result.current).toBe('b')
  })

  // Regression: b sat on the band's edge while a was active, so b never "entered" again when a left.
  it('hands over to an id still on the band when the active one leaves', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'
    const { observerClass } = stubIntersectionObserver()
    const { result } = renderHook(() => useActiveId(IDS))
    const callback = observerClass.mock.calls[0]?.[0]
    const cross = (id: string, isIntersecting: boolean) =>
      act(() => {
        callback?.(
          [
            {
              isIntersecting,
              target: document.getElementById(id),
            } as unknown as IntersectionObserverEntry,
          ],
          undefined as unknown as IntersectionObserver,
        )
      })

    cross('b', true)
    cross('a', true)
    expect(result.current).toBe('a')
    cross('a', false)
    expect(result.current).toBe('b')
  })

  it('clears once the band is above the first element, so returning counts as a change', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'
    const { observerClass } = stubIntersectionObserver()
    const { result } = renderHook(() => useActiveId(IDS))
    const callback = observerClass.mock.calls[0]?.[0]
    const a = document.getElementById('a') as HTMLElement
    const cross = (isIntersecting: boolean) =>
      act(() => {
        callback?.(
          [{ isIntersecting, target: a } as unknown as IntersectionObserverEntry],
          undefined as unknown as IntersectionObserver,
        )
      })

    cross(true)
    expect(result.current).toBe('a')

    a.getBoundingClientRect = () => ({ top: window.innerHeight }) as DOMRect
    cross(false)
    expect(result.current).toBeUndefined()
  })

  it('stays undefined where IntersectionObserver does not exist (jsdom)', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { result } = renderHook(() => useActiveId(IDS))
    expect(result.current).toBeUndefined()
  })
})
