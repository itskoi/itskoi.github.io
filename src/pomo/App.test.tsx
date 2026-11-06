import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { emptyState, type State, start } from './session'
import { defaultSettings, SETTINGS_KEY, saveSettings } from './settings'
import { KEY, save } from './storage'

vi.mock('./art/Sprites', () => ({ Sprites: () => null }))

const T0 = 1_000_000_000
const MIN = 60_000

class FakeWorker {
  static live: FakeWorker[] = []
  onmessage: ((ev: MessageEvent) => void) | null = null
  constructor() {
    FakeWorker.live.push(this)
  }
  terminate() {
    FakeWorker.live = FakeWorker.live.filter((w) => w !== this)
  }
}

// alert.ts keeps its first AudioContext for good, so every test must share one fake to be counted.
let notes = 0
const waves: string[] = []
class FakeAudio {
  currentTime = 0
  destination = {}
  resume = () => Promise.resolve()
  createOscillator = () => {
    notes++
    return {
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      set type(value: string) {
        waves.push(value)
      },
      connect: (next: unknown) => next,
      start: vi.fn(),
      stop: vi.fn(),
    }
  }
  createGain = () => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })
}

const notify = vi.fn()
const requestPermission = vi.fn().mockResolvedValue('granted')

function stubNotification(permission: string) {
  vi.stubGlobal(
    'Notification',
    class {
      static permission = permission
      static requestPermission = requestPermission
      constructor(...args: unknown[]) {
        notify(...args)
      }
    },
  )
}

// A tick from the worker, at this moment in time.
function tickAt(time: number) {
  vi.setSystemTime(time)
  act(() => {
    for (const w of FakeWorker.live) w.onmessage?.(new MessageEvent('message'))
  })
}

const setup = () => {
  const user = userEvent.setup()
  return { user, ...render(<App />) }
}
const treePicker = () => screen.queryByRole('group', { name: /Choose your tree/ })
const selectedKind = () =>
  within(screen.getByRole('group', { name: 'Session type' })).getByRole('button', { pressed: true })
const startButton = () => screen.getByRole('button', { name: /^Start/ })
const timer = () => screen.getByRole('timer').textContent
const savedState = () => JSON.parse(localStorage.getItem(KEY) as string) as State
const waitingOnBreak: State = {
  step: 1,
  session: null,
  trees: [{ plantedAt: 1, stage: 3, species: 'mai' }],
  lastSpecies: 'mai',
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(T0)
  FakeWorker.live = []
  vi.stubGlobal('Worker', FakeWorker)
  stubNotification('granted')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  notify.mockClear()
  requestPermission.mockClear()
  localStorage.clear()
})

describe('countdown', () => {
  it('recalculates from the end time on each tick and runs only with a session', async () => {
    const { user } = setup()
    expect(FakeWorker.live).toHaveLength(0)
    await user.click(startButton())
    expect(FakeWorker.live).toHaveLength(1)
    expect(timer()).toBe('25:00')
    tickAt(T0 + 7 * MIN + 500)
    expect(timer()).toBe('18:00')
  })

  it('moves to the next session on the first tick after the end time', async () => {
    const { user } = setup()
    await user.click(startButton())
    tickAt(T0 + 25 * MIN - 1)
    expect(screen.queryByRole('button', { name: 'Start Break' })).toBeNull()
    tickAt(T0 + 25 * MIN)
    expect(screen.getByRole('button', { name: 'Start Break' })).toBeInTheDocument()
    expect(FakeWorker.live).toHaveLength(0)
    expect(savedState().trees).toEqual([{ plantedAt: T0, stage: 3, species: 'phuong' }])
  })

  it('shows the time left and session kind in the tab title', async () => {
    const { user } = setup()
    expect(document.title).toBe('Koidoro')
    await user.click(startButton())
    expect(document.title).toBe('25:00 Work · Koidoro')
    tickAt(T0 + 7 * MIN)
    expect(document.title).toBe('18:00 Work · Koidoro')
    tickAt(T0 + 25 * MIN)
    expect(document.title).toBe('Koidoro')
    await user.click(startButton())
    expect(document.title).toBe('05:00 Break · Koidoro')
  })

  it('restores the tab title countdown after a reload', async () => {
    const { user, unmount } = setup()
    await user.click(startButton())
    unmount()
    vi.setSystemTime(T0 + 10 * MIN)
    render(<App />)
    expect(document.title).toBe('15:00 Work · Koidoro')
  })

  it('never starts a new session by itself', async () => {
    const { user } = setup()
    await user.click(startButton())
    tickAt(T0 + 25 * MIN)
    expect(screen.queryByRole('timer')).toBeNull()
    expect(savedState().session).toBeNull()
  })
})

describe('views', () => {
  it('offers the picker before Work with Phượng preselected on first launch', () => {
    setup()
    expect(selectedKind()).toHaveTextContent('Work')
    const trees = treePicker() as HTMLElement
    expect(within(trees).getByRole('button', { pressed: true })).toHaveTextContent('Phượng')
    expect(within(trees).getAllByRole('button', { pressed: false })).toHaveLength(5)
  })

  it('preselects the tree started last, and starts with the one picked', async () => {
    save({ ...emptyState, lastSpecies: 'mai' })
    const { user, unmount } = setup()
    const trees = treePicker() as HTMLElement
    expect(within(trees).getByRole('button', { pressed: true })).toHaveTextContent('Mai')
    await user.click(screen.getByRole('button', { name: /^Tre/ }))
    await user.click(startButton())
    expect(screen.getByRole('img', { name: /^Tre tree at the Seed stage/ })).toBeInTheDocument()
    expect(savedState().lastSpecies).toBe('tre')
    unmount()
    expect(savedState().session?.species).toBe('tre')
  })

  it('shows the picker only before Work', async () => {
    save(waitingOnBreak)
    const { user } = setup()
    expect(treePicker()).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Start Break' }))
    expect(treePicker()).toBeNull()
  })

  it('selects the next session in the cycle by default', () => {
    save({ ...emptyState, step: 7 })
    setup()
    expect(selectedKind()).toHaveTextContent('Long break')
    expect(startButton()).toHaveTextContent('Start Long break')
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('offers all three kinds while waiting and none during a session', async () => {
    const { user } = setup()
    const kinds = screen.getByRole('group', { name: 'Session type' })
    expect(
      within(kinds)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Work', 'Break', 'Long break'])
    await user.click(startButton())
    expect(screen.queryByRole('group', { name: 'Session type' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Work' })).toBeInTheDocument()
  })

  it('runs the kind the user chose, then goes back to suggesting the next one', async () => {
    save(emptyState)
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Long break' }))
    expect(selectedKind()).toHaveTextContent('Long break')
    expect(treePicker()).toBeNull()
    expect(screen.getByText('15:00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Start Long break' }))
    expect(timer()).toBe('15:00')
    expect(savedState().session?.species).toBeNull()
    tickAt(T0 + 15 * MIN)
    expect(notify.mock.calls[0][0]).toContain('Work')
    expect(selectedKind()).toHaveTextContent('Work')
    expect(savedState().trees).toEqual([])
  })

  it('lets the user choose Work instead of a break', async () => {
    save(waitingOnBreak)
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Work' }))
    expect(treePicker()).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Start Work' }))
    tickAt(T0 + 25 * MIN)
    expect(savedState().trees).toHaveLength(2)
    expect(selectedKind()).toHaveTextContent('Break')
  })

  const garden = () => screen.queryByRole('group', { name: /^Garden/ })

  it('hides the garden while waiting and shows it during a break, for watering', async () => {
    save(waitingOnBreak)
    const { user } = setup()
    expect(garden()).toBeNull()
    await user.click(startButton())
    expect(garden()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Water this Mai mature' })).toBeInTheDocument()
    expect(timer()).toBe('05:00')
    expect(screen.getByText(/water it/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Start/ })).toBeNull()
  })

  it('lets the user view the garden while waiting, without watering', async () => {
    save(waitingOnBreak)
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'View garden' }))
    expect(garden()).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mai mature' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Water this/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'View tree' }))
    expect(garden()).toBeNull()
  })

  it('switches between the garden and the growing tree during Work', async () => {
    save({ ...waitingOnBreak, step: 0 })
    const { user, container } = setup()
    await user.click(startButton())
    expect(garden()).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'View tree' }))
    expect(garden()).toBeNull()
    const stage = container.querySelector('.stage') as HTMLElement
    expect(within(stage).getByRole('img', { name: /tree at the Seed stage/ })).toBeInTheDocument()
  })

  it('shows the garden during Work to look at, with the growing tree in the sidebar', async () => {
    save({ ...waitingOnBreak, step: 0 })
    const { user, container } = setup()
    expect(garden()).toBeNull()
    await user.click(startButton())
    expect(container.querySelector('.stage')).toContainElement(garden())
    expect(screen.getByRole('img', { name: 'Mai mature' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Water this/ })).toBeNull()
    expect(screen.queryByText(/water it/)).toBeNull()
    const card = container.querySelector('.tree-card') as HTMLElement
    expect(within(card).getByRole('img', { name: /tree at the Seed stage/ })).toBeInTheDocument()
  })

  it('keeps the growing tree out of the garden until the session ends', async () => {
    save({ ...waitingOnBreak, step: 0 })
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /^Tre/ }))
    await user.click(startButton())
    expect(garden()).toHaveAccessibleName('Garden with 1 tree')
    tickAt(T0 + 25 * MIN)
    await user.click(startButton())
    expect(garden()).toHaveAccessibleName('Garden with 2 trees')
  })

  it('says the garden is empty during the first Work session', async () => {
    const { user } = setup()
    await user.click(startButton())
    expect(screen.getByText(/garden is empty/i)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /tree at the Seed stage/ })).toBeInTheDocument()
  })

  it('grows the tree through its stages during Work', async () => {
    const { user } = setup()
    await user.click(startButton())
    expect(screen.getByRole('img', { name: /Seed/ })).toBeInTheDocument()
    tickAt(T0 + 9 * MIN)
    expect(screen.getByRole('img', { name: /Sprout/ })).toBeInTheDocument()
    tickAt(T0 + 17 * MIN)
    expect(screen.getByRole('img', { name: /Sapling/ })).toBeInTheDocument()
  })

  it('keeps the session running when the abandon confirm is declined', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { user } = setup()
    await user.click(startButton())
    await user.click(screen.getByRole('button', { name: 'Abandon' }))
    expect(screen.getByRole('button', { name: 'Abandon' })).toBeInTheDocument()
    expect(savedState().session).not.toBeNull()
    expect(savedState().trees).toEqual([])
  })

  it('returns to waiting for Work when the abandon is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = setup()
    await user.click(startButton())
    tickAt(T0 + 10 * MIN)
    await user.click(screen.getByRole('button', { name: 'Abandon' }))
    expect(screen.getByRole('button', { name: 'Start Work' })).toBeInTheDocument()
    expect(savedState().trees).toEqual([{ plantedAt: T0, stage: 1, species: 'phuong' }])
    expect(savedState().step).toBe(0)
  })

  it('ends a break early and counts it', async () => {
    save(waitingOnBreak)
    const { user } = setup()
    await user.click(startButton())
    await user.click(screen.getByRole('button', { name: 'End break' }))
    expect(screen.getByRole('button', { name: 'Start Work' })).toBeInTheDocument()
    expect(savedState().step).toBe(2)
  })

  it('offers no watering hint for an empty garden', async () => {
    save({ ...emptyState, step: 1 })
    const { user } = setup()
    await user.click(startButton())
    expect(screen.getByText(/garden is empty/i)).toBeInTheDocument()
    expect(screen.queryByText(/water it/)).toBeNull()
  })

  it('floats the timer over the garden and keeps the title and controls out of it', async () => {
    save(waitingOnBreak)
    const { user, container } = setup()
    await user.click(startButton())
    const stage = container.querySelector('.stage') as HTMLElement
    expect(stage).toContainElement(screen.getByRole('group', { name: /^Garden/ }))
    expect(stage).toContainElement(screen.getByRole('timer'))
    for (const el of [
      screen.getByRole('heading', { name: 'Koidoro' }),
      screen.getByRole('button', { name: 'End break' }),
    ]) {
      expect(stage).not.toContainElement(el)
    }
  })
})

describe('warnings', () => {
  it('warns on a failed save and keeps working', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const { user } = setup()
    expect(screen.getByRole('alert')).toHaveTextContent(/may not be kept/)
    await user.click(startButton())
    expect(timer()).toBe('25:00')
  })

  it('says when the garden could not be read, and keeps the bad data', () => {
    localStorage.setItem(KEY, '{not json')
    setup()
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be read/)
    expect(localStorage.getItem('koidoro.state.corrupt')).toBe('{not json')
    expect(screen.getByRole('button', { name: 'Start Work' })).toBeInTheDocument()
  })
})

describe('saving and other tabs', () => {
  it('applies a storage event from another tab', () => {
    setup()
    const other = start(emptyState, 'dua', T0)
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: KEY, newValue: JSON.stringify(other) }),
      )
    })
    expect(screen.getByRole('img', { name: /^Dừa tree/ })).toBeInTheDocument()
    expect(timer()).toBe('25:00')
    expect(FakeWorker.live).toHaveLength(1)
  })

  it('ignores storage events it cannot use', () => {
    setup()
    for (const event of [
      { key: 'other', newValue: JSON.stringify(start(emptyState, 'dua', T0)) },
      { key: KEY, newValue: '{bad' },
      { key: KEY, newValue: null },
      { key: null, newValue: null },
    ]) {
      act(() => {
        window.dispatchEvent(new StorageEvent('storage', event))
      })
      expect(screen.getByRole('button', { name: 'Start Work' })).toBeInTheDocument()
    }
  })

  it('resumes the running session after a reload', async () => {
    const { user, unmount } = setup()
    await user.click(screen.getByRole('button', { name: /^Tre/ }))
    await user.click(startButton())
    unmount()
    expect(FakeWorker.live).toHaveLength(0)
    vi.setSystemTime(T0 + 10 * MIN)
    render(<App />)
    expect(timer()).toBe('15:00')
    expect(screen.getByRole('img', { name: /^Tre tree at the Sprout stage/ })).toBeInTheDocument()
    expect(FakeWorker.live).toHaveLength(1)
    tickAt(T0 + 25 * MIN)
    expect(screen.getByRole('button', { name: 'Start Break' })).toBeInTheDocument()
  })
})

describe('settings', () => {
  const minutesField = (name: RegExp) => screen.getByRole('spinbutton', { name })
  const savedSettings = () => JSON.parse(localStorage.getItem(SETTINGS_KEY) as string)

  it('stays collapsed until opened, on every screen', async () => {
    const { user, container } = setup()
    const panel = () => container.querySelector('details.settings') as HTMLDetailsElement
    expect(panel().open).toBe(false)
    await user.click(screen.getByText('Settings'))
    expect(panel().open).toBe(true)
    await user.click(startButton())
    expect(panel()).toBeInTheDocument()
  })

  it('uses the configured time for the session kind, and shows it before starting', async () => {
    saveSettings({ ...defaultSettings, minutes: { Work: 50, Break: 10, 'Long break': 30 } })
    const { user } = setup()
    expect(screen.getByText('50:00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Long break' }))
    expect(screen.getByText('30:00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Work' }))
    await user.click(startButton())
    expect(timer()).toBe('50:00')
    expect(savedState().session?.endsAt).toBe(T0 + 50 * MIN)
  })

  it('saves a typed time and ignores values out of range', async () => {
    const { user } = setup()
    const work = minutesField(/^Work/)
    await user.clear(work)
    expect(savedSettings().minutes.Work).toBe(25)
    await user.type(work, '40')
    expect(savedSettings().minutes.Work).toBe(40)
    expect(screen.getByText('40:00')).toBeInTheDocument()
    await user.clear(work)
    await user.type(work, '999')
    expect(work).toHaveAttribute('aria-invalid', 'true')
    expect(savedSettings().minutes.Work).toBe(99)
    await user.tab()
    expect(work).toHaveValue(99)
    expect(work).toHaveAttribute('aria-invalid', 'false')
  })

  it('leaves a running session alone when a time changes', async () => {
    const { user } = setup()
    await user.click(startButton())
    const work = minutesField(/^Work/)
    await user.clear(work)
    await user.type(work, '50')
    expect(timer()).toBe('25:00')
    expect(savedState().session?.endsAt).toBe(T0 + 25 * MIN)
  })

  it('applies the background scheme and remembers it after a reload', async () => {
    const { user, container, unmount } = setup()
    const app = () => container.querySelector('.app') as HTMLElement
    expect(app()).toHaveAttribute('data-scheme', 'sky')
    await user.click(screen.getByRole('button', { name: 'Sunset' }))
    expect(app()).toHaveAttribute('data-scheme', 'sunset')
    expect(screen.getByRole('button', { name: 'Sunset' })).toHaveAttribute('aria-pressed', 'true')
    unmount()
    const second = render(<App />)
    expect(second.container.querySelector('.app')).toHaveAttribute('data-scheme', 'sunset')
  })

  it('follows settings changed in another tab', () => {
    const { container } = setup()
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: SETTINGS_KEY,
          newValue: JSON.stringify({ ...defaultSettings, scheme: 'night' }),
        }),
      )
    })
    expect(container.querySelector('.app')).toHaveAttribute('data-scheme', 'night')
  })

  it('opens a garden saved before settings existed, with no warning', () => {
    save(waitingOnBreak)
    localStorage.removeItem(SETTINGS_KEY)
    setup()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('button', { name: 'Start Break' })).toBeInTheDocument()
  })

  it('previews the sound on choosing it and plays it at the end of a session', async () => {
    notes = 0
    vi.stubGlobal('AudioContext', FakeAudio)
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Marimba' }))
    expect(notes).toBeGreaterThan(0)
    expect(waves.at(-1)).toBe('triangle')
    await user.click(screen.getByRole('button', { name: 'No sound' }))
    await user.click(startButton())
    notes = 0
    tickAt(T0 + 25 * MIN)
    expect(notes).toBe(0)
    expect(notify).toHaveBeenCalledTimes(1)
  })
})

describe('sounds', () => {
  beforeEach(() => {
    notes = 0
    vi.stubGlobal('AudioContext', FakeAudio)
  })

  it('plays on Start and on a tick-driven ending', async () => {
    const { user } = setup()
    await user.click(startButton())
    expect(notes).toBeGreaterThan(0)
    notes = 0
    tickAt(T0 + 25 * MIN)
    expect(notes).toBeGreaterThan(0)
  })

  it('stays silent on abandon', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = setup()
    await user.click(startButton())
    notes = 0
    await user.click(screen.getByRole('button', { name: 'Abandon' }))
    expect(notes).toBe(0)
  })

  it('stays silent on end break', async () => {
    save(waitingOnBreak)
    const { user } = setup()
    await user.click(startButton())
    notes = 0
    await user.click(screen.getByRole('button', { name: 'End break' }))
    expect(notes).toBe(0)
  })

  it('stays silent for a session that expired while the app was closed', () => {
    save(start(emptyState, 'mai', T0 - 60 * MIN))
    setup()
    expect(notes).toBe(0)
  })
})

describe('alerts', () => {
  it('alerts on a tick-driven ending, naming the next kind, only once', async () => {
    const { user } = setup()
    await user.click(startButton())
    tickAt(T0 + 25 * MIN - 1)
    expect(notify).not.toHaveBeenCalled()
    const [worker] = FakeWorker.live
    vi.setSystemTime(T0 + 25 * MIN)
    act(() => {
      // Two ticks queued behind a blocking dialog arrive together.
      worker.onmessage?.(new MessageEvent('message'))
      worker.onmessage?.(new MessageEvent('message'))
    })
    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify.mock.calls[0][0]).toContain('Break')
  })

  it('names the Long break after the fourth Work and Work after a break', async () => {
    save({ ...emptyState, step: 6 })
    const { user, unmount } = setup()
    await user.click(startButton())
    tickAt(T0 + 25 * MIN)
    expect(notify.mock.calls[0][0]).toContain('Long break')
    await user.click(startButton())
    tickAt(T0 + 40 * MIN)
    expect(notify.mock.calls[1][0]).toContain('Work')
    unmount()
  })

  it('does not alert on abandon', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = setup()
    await user.click(startButton())
    await user.click(screen.getByRole('button', { name: 'Abandon' }))
    expect(notify).not.toHaveBeenCalled()
  })

  it('does not alert on end break', async () => {
    save(waitingOnBreak)
    const { user } = setup()
    await user.click(startButton())
    await user.click(screen.getByRole('button', { name: 'End break' }))
    expect(notify).not.toHaveBeenCalled()
  })

  it('does not alert for a session that expired while the app was closed', () => {
    save(start(emptyState, 'mai', T0 - 60 * MIN))
    setup()
    expect(screen.getByRole('button', { name: 'Start Break' })).toBeInTheDocument()
    expect(savedState().trees).toEqual([{ plantedAt: T0 - 60 * MIN, stage: 3, species: 'mai' }])
    expect(FakeWorker.live).toHaveLength(0)
    expect(notify).not.toHaveBeenCalled()
  })

  it('asks for permission on Start while it is default, and starts regardless', async () => {
    stubNotification('default')
    const { user } = setup()
    expect(requestPermission).not.toHaveBeenCalled()
    await user.click(startButton())
    expect(requestPermission).toHaveBeenCalledTimes(1)
    expect(timer()).toBe('25:00')
  })

  it.each(['granted', 'denied'])('does not ask for permission once %s', async (permission) => {
    stubNotification(permission)
    const { user } = setup()
    await user.click(startButton())
    expect(requestPermission).not.toHaveBeenCalled()
  })

  it('keeps the timer working when notifications are missing', async () => {
    vi.stubGlobal('Notification', undefined)
    const { user } = setup()
    await user.click(startButton())
    tickAt(T0 + 25 * MIN)
    expect(screen.getByRole('button', { name: 'Start Break' })).toBeInTheDocument()
  })
})
