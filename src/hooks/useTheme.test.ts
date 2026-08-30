import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setTheme } from '@/lib/theme'
import { useTheme } from './useTheme'

function reset() {
  document.documentElement.removeAttribute('data-theme')
  try {
    window.localStorage.clear()
  } catch {
    /* ignore */
  }
}

beforeEach(reset)
afterEach(reset)

describe('useTheme', () => {
  it('reports the resolved theme on mount', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('re-renders when the theme changes externally', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    act(() => setTheme('dark'))
    expect(result.current.theme).toBe('dark')
  })

  it('toggle flips the reported theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')
  })

  it('unsubscribes on unmount', () => {
    const { result, unmount } = renderHook(() => useTheme())
    unmount()
    act(() => setTheme('dark'))
    expect(result.current.theme).toBe('light')
  })
})
