import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  figureHex,
  getTheme,
  initTheme,
  onThemeChange,
  readPieceColors,
  readSceneColors,
  setTheme,
  toggleTheme,
} from './theme'

function reset() {
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.removeProperty('--scene-figure-rgb')
  document.documentElement.style.removeProperty('--scene-piece-rgb')
  try {
    window.localStorage.clear()
  } catch {
    /* ignore */
  }
}

beforeEach(reset)
afterEach(reset)

describe('initTheme', () => {
  it('defaults to dark when nothing is stored and the OS does not prefer light', () => {
    initTheme()
    expect(getTheme()).toBe('dark')
  })

  it('leaves data-theme unset when no choice is stored (OS CSS path owns first paint)', () => {
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('applies a stored choice and sets data-theme', () => {
    window.localStorage.setItem('theme', 'light')
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(getTheme()).toBe('light')
  })

  it('resolves from the OS preference when nothing is stored', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) => ({ matches: query.includes('light'), media: query }) as MediaQueryList,
    )
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
    expect(getTheme()).toBe('light')
    vi.unstubAllGlobals()
  })
})

describe('setTheme / toggleTheme', () => {
  it('setTheme sets the attribute, persists, and notifies subscribers', () => {
    const cb = vi.fn()
    const off = onThemeChange(cb)
    setTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(window.localStorage.getItem('theme')).toBe('light')
    expect(cb).toHaveBeenCalledWith('light')
    off()
  })

  it('toggleTheme flips dark <-> light', () => {
    setTheme('dark')
    expect(toggleTheme()).toBe('light')
    expect(getTheme()).toBe('light')
    expect(toggleTheme()).toBe('dark')
    expect(getTheme()).toBe('dark')
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
    document.documentElement.style.setProperty('--scene-figure-rgb', '11 14 18')
    expect(readSceneColors()).toEqual({ r: 11, g: 14, b: 18 })
  })

  it('falls back to white when the token is missing', () => {
    expect(readSceneColors()).toEqual({ r: 255, g: 255, b: 255 })
  })
})

describe('readPieceColors', () => {
  it('parses --scene-piece-rgb into RGB', () => {
    document.documentElement.style.setProperty('--scene-piece-rgb', '29 78 216')
    expect(readPieceColors()).toEqual({ r: 29, g: 78, b: 216 })
  })

  it('falls back to electric blue when the token is missing', () => {
    expect(readPieceColors()).toEqual({ r: 91, g: 164, b: 255 })
  })
})

describe('figureHex', () => {
  it('packs the scene color as 0xRRGGBB', () => {
    expect(figureHex({ r: 255, g: 255, b: 255 })).toBe(0xffffff) // dark mode → white pieces
    expect(figureHex({ r: 11, g: 14, b: 18 })).toBe(0x0b0e12) // light mode → ink pieces
  })
})
