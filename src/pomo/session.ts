export const SPECIES_IDS = ['phuong', 'mai', 'dao', 'da', 'tre', 'dua'] as const
export type Species = (typeof SPECIES_IDS)[number]
export type Tree = { plantedAt: number; stage: number; species: Species } // stage 3 is mature; plantedAt also identifies it
export type Session = { startedAt: number; endsAt: number; species: Species | null } // null during breaks
export type State = { step: number; session: Session | null; trees: Tree[]; lastSpecies: Species }
export const KINDS = ['Work', 'Break', 'Long break'] as const
export type Kind = (typeof KINDS)[number]

const MINUTE = 60_000
const DURATIONS: Record<Kind, number> = {
  Work: 25 * MINUTE,
  Break: 5 * MINUTE,
  'Long break': 15 * MINUTE,
}
export const MATURE = 3

export const emptyState: State = { step: 0, session: null, trees: [], lastSpecies: 'phuong' }

export const kindAt = (step: number): Kind =>
  step === 7 ? 'Long break' : step % 2 ? 'Break' : 'Work'
export const durationOf = (kind: Kind) => DURATIONS[kind]
export const nextKind = (step: number) => kindAt((step + 1) % 8)

// One immature stage for each third of the session. Only reaching the end time gives stage 3.
export function stageAt(session: Session, now: number) {
  if (now >= session.endsAt) return MATURE
  const third = (session.endsAt - session.startedAt) / 3
  return Math.max(0, Math.min(2, Math.floor((now - session.startedAt) / third)))
}

// The first step from here with that kind, so the cycle carries on from a session the user chose.
export function stepFor(step: number, kind: Kind) {
  let found = step
  while (kindAt(found) !== kind) found = (found + 1) % 8
  return found
}

export function start(
  state: State,
  species: Species,
  now: number,
  kind = kindAt(state.step),
  duration = DURATIONS[kind],
): State {
  if (state.session) return state
  const step = stepFor(state.step, kind)
  const endsAt = now + duration
  return kind === 'Work'
    ? { ...state, step, session: { startedAt: now, endsAt, species }, lastSpecies: species }
    : { ...state, step, session: { startedAt: now, endsAt, species: null } }
}

const advance = (state: State, trees = state.trees): State => ({
  ...state,
  step: (state.step + 1) % 8,
  session: null,
  trees,
})

const withTree = (state: State, session: Session, stage: number) =>
  session.species
    ? [...state.trees, { plantedAt: session.startedAt, stage, species: session.species }]
    : state.trees

export function finish(state: State, now: number): State {
  const { session } = state
  if (!session || now < session.endsAt) return state
  return advance(state, withTree(state, session, MATURE))
}

export function abandon(state: State, now: number): State {
  const { session } = state
  if (!session?.species) return state
  // The confirm dialog blocks the page, so the end time can pass while it is open. That session ran to its end.
  if (now >= session.endsAt) return finish(state, now)
  return { ...state, session: null, trees: withTree(state, session, stageAt(session, now)) }
}

export function endBreak(state: State): State {
  return state.session && !state.session.species ? advance(state) : state
}

export type Action =
  | { type: 'start'; species: Species; now: number; kind: Kind; duration: number }
  | { type: 'finish'; now: number }
  | { type: 'abandon'; now: number }
  | { type: 'endBreak' }
  | { type: 'replace'; state: State }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return start(state, action.species, action.now, action.kind, action.duration)
    case 'finish':
      return finish(state, action.now)
    case 'abandon':
      return abandon(state, action.now)
    case 'endBreak':
      return endBreak(state)
    case 'replace':
      return action.state
  }
}
