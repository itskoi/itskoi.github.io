import type { Kind } from './session'
import type { EndSound } from './settings'

const TAG = 'koidoro-session-end' // A fixed tag means two open tabs show one notification, not two.

type Note = {
  at: number
  length: number
  from: number
  to?: number
  volume: number
  wave?: OscillatorType
}
type Voice = Pick<Note, 'length' | 'volume' | 'wave'> & {
  gap: number
  octave?: number
  glide?: number
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const START: Note[] = [{ at: 0, length: 0.12, from: E5, volume: 0.08 }]
// Rising means back to work and falling means rest, so every sound says what is next without looking.
const END_TUNES: Record<Kind, number[]> = {
  Work: [C5, E5, G5],
  Break: [G5, E5],
  'Long break': [G5, E5, C5],
}
const END_VOICES: Record<Exclude<EndSound, 'none'>, Voice> = {
  chime: { gap: 0.16, length: 0.5, volume: 0.2 },
  bell: { gap: 0.3, length: 1.5, volume: 0.16, octave: 2 },
  marimba: { gap: 0.13, length: 0.25, volume: 0.3, wave: 'triangle' },
  digital: { gap: 0.13, length: 0.09, volume: 0.06, wave: 'square', octave: 2 },
  birds: { gap: 0.15, length: 0.11, volume: 0.12, octave: 4, glide: 1.4 },
}
function endNotes(sound: EndSound, next: Kind): Note[] {
  if (sound === 'none') return []
  const { gap, length, volume, wave, octave = 1, glide } = END_VOICES[sound]
  return END_TUNES[next].map((pitch, i) => ({
    at: i * gap,
    length,
    volume,
    wave,
    from: pitch * octave,
    to: glide && pitch * octave * glide,
  }))
}
// Timed to the drops falling in the watering animation.
const WATER: Note[] = Array.from({ length: 7 }, (_, i) => ({
  at: 0.45 + i * 0.11,
  length: 0.07,
  from: 500 + (i % 3) * 150,
  to: 1000 + (i % 3) * 300,
  volume: 0.06,
}))

let audio: AudioContext | null = null

function play(notes: Note[]) {
  try {
    audio ??= new AudioContext()
    audio.resume().catch(() => {})
    for (const { at, length, from, to, volume, wave = 'sine' } of notes) {
      const start = audio.currentTime + at
      const end = start + length
      const oscillator = audio.createOscillator()
      oscillator.type = wave
      const gain = audio.createGain()
      oscillator.frequency.setValueAtTime(from, start)
      if (to) oscillator.frequency.exponentialRampToValueAtTime(to, end)
      gain.gain.setValueAtTime(volume, start)
      gain.gain.exponentialRampToValueAtTime(0.001, end)
      oscillator.connect(gain).connect(audio.destination)
      oscillator.start(start)
      oscillator.stop(end)
    }
  } catch {
    // No sound on this browser. The notification and the page still work.
  }
}

// Runs on the Start click, because browsers only allow sound and the permission prompt after a click.
export function prepareAlerts() {
  play(START)
  try {
    if (Notification.permission === 'default') Notification.requestPermission().catch(() => {})
  } catch {
    // No notifications on this browser. The sound and the page still work.
  }
}

export const playWaterSound = () => play(WATER)

// A preview from the settings panel.
export const playEndSound = (sound: EndSound) => play(endNotes(sound, 'Work'))

export function alertSessionEnd(next: Kind, sound: EndSound = 'chime') {
  play(endNotes(sound, next))
  try {
    if (Notification.permission === 'granted') {
      new Notification(`Session over. ${next} is next.`, { tag: TAG })
    }
  } catch {
    // Android Chrome throws on new Notification. The sound and the page still work.
  }
}
