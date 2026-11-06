import {
  defaultSettings,
  loadSettings,
  parseSettings,
  SETTINGS_KEY,
  saveSettings,
} from './settings'
import { SAVE_PROBLEM } from './storage'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

it('gives the defaults on first launch', () => {
  expect(loadSettings()).toEqual(defaultSettings)
})

it('round-trips settings', () => {
  const settings = {
    minutes: { Work: 50, Break: 10, 'Long break': 30 },
    endSound: 'bell' as const,
    scheme: 'night' as const,
  }
  expect(saveSettings(settings)).toBeNull()
  expect(loadSettings()).toEqual(settings)
})

it.each(['{not json', 'null', '[]', '"text"', '{}'])('falls back to the defaults for %s', (raw) => {
  expect(parseSettings(raw)).toEqual(defaultSettings)
})

it('falls back field by field and keeps what is valid', () => {
  const raw = JSON.stringify({
    minutes: { Work: 50, Break: 0, 'Long break': 1.5 },
    endSound: 'siren',
    scheme: 'dawn',
  })
  expect(parseSettings(raw)).toEqual({
    minutes: { Work: 50, Break: 5, 'Long break': 15 },
    endSound: 'chime',
    scheme: 'dawn',
  })
})

it.each([0, -5, 181, 2.5, '25', null])('rejects %j as a time', (bad) => {
  const raw = JSON.stringify({ minutes: { Work: bad } })
  expect(parseSettings(raw).minutes.Work).toBe(25)
})

it('accepts the limits of the range', () => {
  const raw = JSON.stringify({ minutes: { Work: 1, Break: 180 } })
  expect(parseSettings(raw).minutes).toMatchObject({ Work: 1, Break: 180 })
})

it('reports a failed save rather than throwing', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('denied')
  })
  expect(saveSettings(defaultSettings)).toBe(SAVE_PROBLEM)
})

it('uses the defaults if storage cannot be read', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied')
  })
  expect(loadSettings()).toEqual(defaultSettings)
  expect(SETTINGS_KEY).not.toBe('koidoro.state')
})
