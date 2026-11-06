import { KINDS, type Kind } from './session'
import { SAVE_PROBLEM } from './storage'

// Kept apart from the session state, so garden data saved before settings existed stays valid.
export const SETTINGS_KEY = 'koidoro.settings'

export const END_SOUNDS = ['chime', 'bell', 'marimba', 'digital', 'birds', 'none'] as const
export type EndSound = (typeof END_SOUNDS)[number]
export const END_SOUND_NAMES: Record<EndSound, string> = {
  chime: 'Chime',
  bell: 'Bell',
  marimba: 'Marimba',
  digital: 'Digital',
  birds: 'Birdsong',
  none: 'No sound',
}

export const SCHEMES = ['sky', 'dawn', 'sunset', 'lagoon', 'blossom', 'night'] as const
export type Scheme = (typeof SCHEMES)[number]
export const SCHEME_NAMES: Record<Scheme, string> = {
  sky: 'Clear sky',
  dawn: 'Dawn',
  sunset: 'Sunset',
  lagoon: 'Lagoon',
  blossom: 'Blossom',
  night: 'Night',
}

export const MIN_MINUTES = 1
export const MAX_MINUTES = 180
export const isValidMinutes = (n: unknown): n is number =>
  Number.isInteger(n) && (n as number) >= MIN_MINUTES && (n as number) <= MAX_MINUTES

export type Settings = { minutes: Record<Kind, number>; endSound: EndSound; scheme: Scheme }

export const defaultSettings: Settings = {
  minutes: { Work: 25, Break: 5, 'Long break': 15 },
  endSound: 'chime',
  scheme: 'sky',
}

const oneOf = <T>(list: readonly T[], v: unknown, fallback: T) =>
  list.includes(v as T) ? (v as T) : fallback

// Nothing here is worth keeping a backup of, so each bad field simply falls back to its default.
export function parseSettings(text: string): Settings {
  let v: Partial<Settings> | null = null
  try {
    v = JSON.parse(text)
  } catch {
    return defaultSettings
  }
  const minutes = { ...defaultSettings.minutes }
  for (const kind of KINDS) {
    const value = v?.minutes?.[kind]
    if (isValidMinutes(value)) minutes[kind] = value
  }
  return {
    minutes,
    endSound: oneOf(END_SOUNDS, v?.endSound, defaultSettings.endSound),
    scheme: oneOf(SCHEMES, v?.scheme, defaultSettings.scheme),
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw === null ? defaultSettings : parseSettings(raw)
  } catch {
    return defaultSettings
  }
}

// Returns a message for the page if saving failed.
export function saveSettings(settings: Settings): string | null {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return null
  } catch {
    return SAVE_PROBLEM
  }
}
