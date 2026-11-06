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
  it('defaults to dark when nothing is stored', () => {
    initTheme()
    expect(getTheme()).toBe('dark')
  })

  it('leaves data-theme unset when no choice is stored (the dark :root owns first paint)', () => {
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('applies a stored choice and sets data-theme', () => {
    window.localStorage.setItem('theme', 'light')
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(getTheme()).toBe('light')
  })

  it('ignores an OS light preference when nothing is stored', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) => ({ matches: query.includes('light'), media: query }) as MediaQueryList,
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

  it('falls back to white ink when the token is missing (dark is the default mode)', () => {
    expect(readSceneColors()).toEqual({ r: 255, g: 255, b: 255 })
  })
})
