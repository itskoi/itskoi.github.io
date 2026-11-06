import { emptyState, type State, start } from './session'
import { KEY, load, parseState, SAVE_PROBLEM, save } from './storage'

const T0 = 1_000_000
const WORK = 25 * 60_000
const CORRUPT = 'koidoro.state.corrupt'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('load and save', () => {
  it('gives the empty starting state on first launch', () => {
    expect(load(T0)).toEqual({ state: emptyState, problem: null })
    expect(localStorage.getItem(CORRUPT)).toBeNull()
  })

  it('round-trips state', () => {
    const state: State = {
      step: 3,
      session: { startedAt: T0, endsAt: T0 + 300_000, species: null },
      trees: [{ plantedAt: 5, stage: 2, species: 'dua' }],
      lastSpecies: 'da',
    }
    expect(save(state)).toBeNull()
    expect(load(T0 + 1000)).toEqual({ state, problem: null })
  })

  it('brings an expired Work session back as a mature tree', () => {
    save(start(emptyState, 'tre', T0))
    const { state } = load(T0 + WORK + 60_000)
    expect(state.trees).toEqual([{ plantedAt: T0, stage: 3, species: 'tre' }])
    expect(state.session).toBeNull()
    expect(state.step).toBe(1)
  })

  it('keeps a session that has not ended running', () => {
    const running = start(emptyState, 'tre', T0)
    save(running)
    expect(load(T0 + 1000).state).toEqual(running)
  })
})

describe('bad data', () => {
  const session = { startedAt: 1, endsAt: 2, species: 'mai' }
  const good = { step: 0, session: null, trees: [], lastSpecies: 'mai' }
  const bad: [string, string][] = [
    ['malformed JSON', '{not json'],
    ['a JSON null', 'null'],
    ['wrong shape', '{"foo":1}'],
    ['a missing field', JSON.stringify({ step: 0, session: null, trees: [] })],
    ['a step out of range', JSON.stringify({ ...good, step: 8 })],
    ['trees of the wrong type', JSON.stringify({ ...good, trees: 'none' })],
    ['an unknown species', JSON.stringify({ ...good, lastSpecies: 'oak' })],
    [
      'an unknown tree species',
      JSON.stringify({ ...good, trees: [{ plantedAt: 1, stage: 3, species: 'oak' }] }),
    ],
    [
      'a stage out of range',
      JSON.stringify({ ...good, trees: [{ plantedAt: 1, stage: 4, species: 'mai' }] }),
    ],
    ['Work with no species', JSON.stringify({ ...good, session: { ...session, species: null } })],
    ['a break with a species', JSON.stringify({ ...good, step: 1, session })],
  ]

  it.each(bad)('keeps a copy of %s and starts empty', (_, raw) => {
    localStorage.setItem(KEY, raw)
    const { state, problem } = load(T0)
    expect(state).toEqual(emptyState)
    expect(problem).toMatch(/could not be read/)
    expect(localStorage.getItem(CORRUPT)).toBe(raw)
  })

  it('accepts a valid session', () => {
    expect(parseState(JSON.stringify({ ...good, session }))).not.toBeNull()
  })

  it('does not overwrite unreadable data when the backup copy fails', () => {
    localStorage.setItem(KEY, '{not json')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('full')
    })
    expect(load(T0).problem).toMatch(/could not be read/)
    expect(save(emptyState)).toBe(SAVE_PROBLEM)
    expect(localStorage.getItem(KEY)).toBe('{not json')
  })
})

describe('failed saves', () => {
  it('reports a problem rather than throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(save(emptyState)).toBe(SAVE_PROBLEM)
  })

  it('starts empty and reports a problem if storage cannot be read at all', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(load(T0)).toEqual({ state: emptyState, problem: SAVE_PROBLEM })
  })
})
