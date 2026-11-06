import { emptyState, finish, type Session, SPECIES_IDS, type State, type Tree } from './session'

export const KEY = 'koidoro.state'
const CORRUPT_KEY = 'koidoro.state.corrupt'

export const SAVE_PROBLEM = 'Could not save. Your progress may not be kept.'
const READ_PROBLEM = 'Your saved garden could not be read, so this is a new one.'
const COPY_PROBLEM =
  'Your saved garden could not be read or backed up, so nothing will be saved over it.'

// Set when unreadable data has no backup, so saving must not overwrite the only copy.
let holdSaves = false

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isSpecies = (v: unknown) => SPECIES_IDS.some((id) => id === v)
const isInt = (v: unknown, min: number, max: number) =>
  Number.isInteger(v) && (v as number) >= min && (v as number) <= max

function isTree(v: unknown): v is Tree {
  return (
    isObject(v) && typeof v.plantedAt === 'number' && isInt(v.stage, 0, 3) && isSpecies(v.species)
  )
}

// A Work step (even) must carry a species and a break step must not, or finishing would break.
function isSession(v: unknown, step: number): v is Session {
  return (
    isObject(v) &&
    typeof v.startedAt === 'number' &&
    typeof v.endsAt === 'number' &&
    (step % 2 ? v.species === null : isSpecies(v.species))
  )
}

// Returns null unless the text is a valid saved state.
export function parseState(text: string): State | null {
  let v: unknown
  try {
    v = JSON.parse(text)
  } catch {
    return null
  }
  if (
    !isObject(v) ||
    !isInt(v.step, 0, 7) ||
    !(v.session === null || isSession(v.session, v.step as number)) ||
    !Array.isArray(v.trees) ||
    !v.trees.every(isTree) ||
    !isSpecies(v.lastSpecies)
  ) {
    return null
  }
  return v as State
}

export function load(now: number): { state: State; problem: string | null } {
  holdSaves = false
  let raw: string | null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return { state: emptyState, problem: SAVE_PROBLEM }
  }
  if (raw === null) return { state: emptyState, problem: null }
  const state = parseState(raw)
  // finish leaves a session that has not reached its end time alone, and never alerts.
  if (state) return { state: finish(state, now), problem: null }
  try {
    localStorage.setItem(CORRUPT_KEY, raw)
  } catch {
    holdSaves = true
    return { state: emptyState, problem: COPY_PROBLEM }
  }
  return { state: emptyState, problem: READ_PROBLEM }
}

// Returns a message for the page if saving failed.
export function save(state: State): string | null {
  if (holdSaves) return SAVE_PROBLEM
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return null
  } catch {
    return SAVE_PROBLEM
  }
}
