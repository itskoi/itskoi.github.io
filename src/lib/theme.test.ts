import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getTheme, initTheme, onThemeChange, readSceneColors, setTheme, toggleTheme } from './theme'

function reset() {
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.removeProperty('--scene-figure-rgb')
  try {
    window.localStorage.clear()
  } catch {
    /* ignore */
  }
}

beforeEach(reset)
afterEach(reset)

describe('initTheme', () => {
  it('defaults to light (paper) when nothing is stored and the OS preference is unknown', () => {
    initTheme()
    expect(getTheme()).toBe('light')
  })

  it('leaves data-theme unset when no choice is stored (OS CSS path owns first paint)', () => {
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('applies a stored choice and sets data-theme', () => {
    window.localStorage.setItem('theme', 'dark')
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(getTheme()).toBe('dark')
  })

  it('resolves from the OS preference when nothing is stored', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) => ({ matches: query.includes('dark'), media: query }) as MediaQueryList,
    )
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
    expect(getTheme()).toBe('dark')
    vi.unstubAllGlobals()
  })
})

describe('setTheme / toggleTheme', () => {
  it('setTheme sets the attribute, persists, and notifies subscribers', () => {
    const cb = vi.fn()
    const off = onThemeChange(cb)
    setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(cb).toHaveBeenCalledWith('dark')
    off()
  })

  it('toggleTheme flips dark <-> light', () => {
    setTheme('light')
    expect(toggleTheme()).toBe('dark')
    expect(getTheme()).toBe('dark')
    expect(toggleTheme()).toBe('light')
    expect(getTheme()).toBe('light')
  })
})

describe('onThemeChange', () => {
  it('unsubscribe stops further notifications', () => {
    const cb = vi.fn()
    const off = onThemeChange(cb)
    off()
    setTheme('light')
    expect(cb).not.toHaveBeenCalled()
  })
})

describe('readSceneColors', () => {
  it('parses --scene-figure-rgb into RGB', () => {
    document.documentElement.style.setProperty('--scene-figure-rgb', '250 250 250')
    expect(readSceneColors()).toEqual({ r: 250, g: 250, b: 250 })
  })

  it('falls back to ink when the token is missing (paper is the default mode)', () => {
    expect(readSceneColors()).toEqual({ r: 10, g: 10, b: 10 })
  })
})
