import {
  abandon,
  durationOf,
  emptyState,
  endBreak,
  finish,
  kindAt,
  MATURE,
  nextKind,
  type Session,
  type State,
  stageAt,
  start,
  stepFor,
} from './session'

const T0 = 1_000_000
const WORK = 25 * 60_000

// Runs a session to its end, whatever the kind.
const runOut = (state: State, now = T0) => {
  const running = start(state, 'mai', now)
  return finish(running, running.session?.endsAt ?? now)
}

describe('cycle order', () => {
  it('runs Work, Break x3, Work, Long break, then repeats', () => {
    const order = Array.from({ length: 16 }, (_, i) => kindAt(i % 8))
    const round = ['Work', 'Break', 'Work', 'Break', 'Work', 'Break', 'Work', 'Long break']
    expect(order).toEqual([...round, ...round])
    expect(nextKind(6)).toBe('Long break')
    expect(nextKind(7)).toBe('Work')
  })

  it('gives each kind its duration', () => {
    expect(durationOf('Work')).toBe(WORK)
    expect(durationOf('Break')).toBe(5 * 60_000)
    expect(durationOf('Long break')).toBe(15 * 60_000)
  })

  it('reaches a Long break after the fourth Work and wraps to Work', () => {
    let state = emptyState
    for (let i = 0; i < 7; i++) state = runOut(state)
    expect(kindAt(state.step)).toBe('Long break')
    expect(start(state, 'mai', T0).session?.endsAt).toBe(T0 + 15 * 60_000)
    state = runOut(state)
    expect(state.step).toBe(0)
    expect(kindAt(state.step)).toBe('Work')
  })
})

describe('stageAt', () => {
  const session: Session = { startedAt: T0, endsAt: T0 + WORK, species: 'mai' }

  it('is immature at every time before the end', () => {
    for (let t = T0; t < T0 + WORK; t += 1000) expect(stageAt(session, t)).toBeLessThan(MATURE)
    expect(stageAt(session, T0 + WORK - 1)).toBeLessThan(MATURE)
  })

  it('moves up a stage each third and never goes backwards', () => {
    expect(stageAt(session, T0)).toBe(0)
    expect(stageAt(session, T0 + WORK / 3)).toBe(1)
    expect(stageAt(session, T0 + (2 * WORK) / 3)).toBe(2)
    expect(stageAt(session, T0 + WORK)).toBe(MATURE)
    let last = 0
    for (let t = T0; t <= T0 + WORK; t += 5000) {
      expect(stageAt(session, t)).toBeGreaterThanOrEqual(last)
      last = stageAt(session, t)
    }
  })

  it('stays at the seed stage if the clock moves back', () => {
    expect(stageAt(session, T0 - 5000)).toBe(0)
  })
})

describe('start', () => {
  it('sets the end time and updates lastSpecies for Work', () => {
    const state = start(emptyState, 'tre', T0)
    expect(state.session).toEqual({ startedAt: T0, endsAt: T0 + WORK, species: 'tre' })
    expect(state.lastSpecies).toBe('tre')
  })

  it('does nothing while a session runs', () => {
    const running = start(emptyState, 'tre', T0)
    expect(start(running, 'mai', T0 + 1000)).toBe(running)
  })

  it('ignores the species and keeps lastSpecies for a break', () => {
    const onBreak = start({ ...emptyState, step: 1 }, 'tre', T0)
    expect(onBreak.session?.species).toBeNull()
    expect(onBreak.lastSpecies).toBe('phuong')
  })
})

describe('choosing the session kind', () => {
  it('moves to the first step of that kind and carries on from there', () => {
    expect(stepFor(0, 'Break')).toBe(1)
    expect(stepFor(1, 'Work')).toBe(2)
    expect(stepFor(0, 'Long break')).toBe(7)
    expect(stepFor(3, 'Break')).toBe(3)
    expect(stepFor(7, 'Break')).toBe(1)
  })

  it('runs a break instead of Work, with no tree and no change to lastSpecies', () => {
    const running = start(emptyState, 'tre', T0, 'Break')
    expect(running.step).toBe(1)
    expect(running.session).toEqual({ startedAt: T0, endsAt: T0 + 5 * 60_000, species: null })
    expect(running.lastSpecies).toBe('phuong')
    const done = finish(running, T0 + 5 * 60_000)
    expect(done.trees).toEqual([])
    expect(kindAt(done.step)).toBe('Work')
  })

  it('wraps to Work after a Long break chosen early', () => {
    const running = start(emptyState, 'tre', T0, 'Long break')
    expect(running.session?.endsAt).toBe(T0 + 15 * 60_000)
    expect(finish(running, T0 + 15 * 60_000).step).toBe(0)
  })

  it('runs Work instead of a break and grows a tree', () => {
    const running = start({ ...emptyState, step: 1 }, 'tre', T0, 'Work')
    expect(running.step).toBe(2)
    expect(running.lastSpecies).toBe('tre')
    const done = finish(running, T0 + WORK)
    expect(done.trees).toEqual([{ plantedAt: T0, stage: MATURE, species: 'tre' }])
    expect(kindAt(done.step)).toBe('Break')
  })

  it('offers Work again after abandoning a chosen Work session', () => {
    const running = start({ ...emptyState, step: 1 }, 'tre', T0, 'Work')
    expect(kindAt(abandon(running, T0 + 1000).step)).toBe('Work')
  })

  it('does nothing while a session runs', () => {
    const running = start(emptyState, 'tre', T0)
    expect(start(running, 'tre', T0 + 1000, 'Break')).toBe(running)
  })
})

describe('custom durations', () => {
  it('runs for the duration given, and still grows through three stages', () => {
    const running = start(emptyState, 'tre', T0, 'Work', 60_000)
    expect(running.session?.endsAt).toBe(T0 + 60_000)
    const session = running.session as Session
    expect(stageAt(session, T0 + 25_000)).toBe(1)
    expect(stageAt(session, T0 + 45_000)).toBe(2)
    expect(finish(running, T0 + 60_000).trees[0].stage).toBe(MATURE)
  })
})

describe('finish', () => {
  it('adds a mature tree of the chosen species and advances the cycle', () => {
    const running = start(emptyState, 'dao', T0)
    const done = finish(running, T0 + WORK)
    expect(done.trees).toEqual([{ plantedAt: T0, stage: MATURE, species: 'dao' }])
    expect(done.step).toBe(1)
    expect(done.session).toBeNull()
  })

  it('does nothing before the end time, so nothing else can make a tree mature', () => {
    const running = start(emptyState, 'dao', T0)
    expect(finish(running, T0 + WORK - 1)).toBe(running)
  })

  it('adds no tree for a break', () => {
    const running = start({ ...emptyState, step: 1 }, 'dao', T0)
    const done = finish(running, T0 + 5 * 60_000)
    expect(done.trees).toEqual([])
    expect(done.step).toBe(2)
  })
})

describe('abandon', () => {
  const running = start(emptyState, 'dao', T0)

  it('adds a tree at the reached stage without advancing', () => {
    const done = abandon(running, T0 + WORK / 2)
    expect(done.trees).toEqual([{ plantedAt: T0, stage: 1, species: 'dao' }])
    expect(done.step).toBe(0)
    expect(done.session).toBeNull()
  })

  it('leaves a seed when abandoned right away, and never a mature tree in the last second', () => {
    expect(abandon(running, T0 + 2000).trees[0].stage).toBe(0)
    expect(abandon(running, T0 + WORK - 1).trees[0].stage).toBeLessThan(MATURE)
  })

  it('counts as a completed session if the end time passed while confirming', () => {
    const done = abandon(running, T0 + WORK + 500)
    expect(done.trees[0].stage).toBe(MATURE)
    expect(done.step).toBe(1)
  })

  it('does nothing during a break', () => {
    const onBreak = start({ ...emptyState, step: 1 }, 'dao', T0)
    expect(abandon(onBreak, T0 + 1000)).toBe(onBreak)
  })
})

describe('endBreak', () => {
  it('advances without adding a tree', () => {
    const onBreak = start({ ...emptyState, step: 1 }, 'dao', T0)
    const done = endBreak(onBreak)
    expect(done.step).toBe(2)
    expect(done.trees).toEqual([])
    expect(done.session).toBeNull()
  })

  it('does nothing during Work or while waiting', () => {
    const running = start(emptyState, 'dao', T0)
    expect(endBreak(running)).toBe(running)
    expect(endBreak(emptyState)).toBe(emptyState)
  })
})
