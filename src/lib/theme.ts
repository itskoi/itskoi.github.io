export type Theme = 'dark' | 'light'

export interface SceneColors {
  r: number
  g: number
  b: number
}

const STORAGE_KEY = 'theme'
const DEFAULT_SCENE: SceneColors = { r: 10, g: 10, b: 10 }

const listeners = new Set<(theme: Theme) => void>()

function isTheme(value: string | null | undefined): value is Theme {
  return value === 'dark' || value === 'light'
}

function readStorage(): Theme | null {
  try {
    return isTheme(window.localStorage.getItem(STORAGE_KEY))
      ? (window.localStorage.getItem(STORAGE_KEY) as Theme)
      : null
  } catch {
    return null
  }
}

function writeStorage(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* localStorage unavailable (private mode) — the attribute still applies for the session. */
  }
}

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function osTheme(): Theme {
  return prefersDark() ? 'dark' : 'light'
}

function applyAttribute(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}

function emit(theme: Theme): void {
  for (const cb of listeners) cb(theme)
}

export function getTheme(): Theme {
  return isTheme(document.documentElement.dataset.theme)
    ? (document.documentElement.dataset.theme as Theme)
    : osTheme()
}

export function setTheme(theme: Theme): void {
  applyAttribute(theme)
  writeStorage(theme)
  emit(theme)
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

export function onThemeChange(cb: (theme: Theme) => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/**
 * Resolve the theme once, before React mounts (see main.tsx), so the correct
 * tokens apply at first paint. When no choice is stored the data-theme attribute
 * is left unset on purpose — the `prefers-color-scheme` CSS path then owns first
 * paint, while getTheme() still resolves via the OS at runtime.
 */
export function initTheme(): void {
  const stored = readStorage()
  if (stored) applyAttribute(stored)
}

/** The figure color the canvas + 3D layers draw in, parsed from --scene-figure-rgb. */
export function readSceneColors(): SceneColors {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--scene-figure-rgb')
    .trim()
  if (!raw) return { ...DEFAULT_SCENE }
  const parts = raw.split(/[\s,]+/).map((part) => Number.parseInt(part, 10))
  const [r, g, b] = parts
  if (
    r === undefined ||
    g === undefined ||
    b === undefined ||
    Number.isNaN(r) ||
    Number.isNaN(g) ||
    Number.isNaN(b)
  ) {
    return { ...DEFAULT_SCENE }
  }
  return { r, g, b }
}

/** The figure color packed as 0xRRGGBB (for three.js material colors). Defaults to live tokens. */
export function figureHex(scene: SceneColors = readSceneColors()): number {
  return (scene.r << 16) | (scene.g << 8) | scene.b
}

const DEFAULT_PIECE: SceneColors = { r: 10, g: 10, b: 10 }

/** The chess-piece color, parsed from --scene-piece-rgb (ink on paper, paper on ink). */
export function readPieceColors(): SceneColors {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--scene-piece-rgb')
    .trim()
  if (!raw) return { ...DEFAULT_PIECE }
  const parts = raw.split(/[\s,]+/).map((part) => Number.parseInt(part, 10))
  const [r, g, b] = parts
  if (
    r === undefined ||
    g === undefined ||
    b === undefined ||
    Number.isNaN(r) ||
    Number.isNaN(g) ||
    Number.isNaN(b)
  ) {
    return { ...DEFAULT_PIECE }
  }
  return { r, g, b }
}
