import { alertSessionEnd, playEndSound, playWaterSound, prepareAlerts } from './alert'
import { END_SOUNDS } from './settings'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubNotification(permission: string, ctor = vi.fn()) {
  const requestPermission = vi.fn().mockResolvedValue('granted')
  const fake = Object.assign(
    function (this: unknown, ...args: unknown[]) {
      return ctor(...args)
    },
    { permission, requestPermission },
  )
  vi.stubGlobal('Notification', fake)
  return { ctor, requestPermission }
}

const throwing = () => {
  throw new Error('nope')
}

describe('alertSessionEnd', () => {
  beforeEach(() => vi.stubGlobal('AudioContext', throwing))

  it('names the next session kind, with a fixed tag', () => {
    const { ctor } = stubNotification('granted')
    alertSessionEnd('Long break')
    expect(ctor).toHaveBeenCalledTimes(1)
    expect(ctor.mock.calls[0][0]).toContain('Long break')
    expect(ctor.mock.calls[0][1].tag).toBeTruthy()
  })

  it('shows no notification unless permission is granted', () => {
    for (const permission of ['denied', 'default']) {
      const { ctor } = stubNotification(permission)
      alertSessionEnd('Work')
      expect(ctor).not.toHaveBeenCalled()
    }
  })

  it('does not throw when Notification is missing', () => {
    vi.stubGlobal('Notification', undefined)
    expect(() => alertSessionEnd('Work')).not.toThrow()
  })

  it('does not throw when Notification throws', () => {
    stubNotification('granted', vi.fn(throwing))
    expect(() => alertSessionEnd('Work')).not.toThrow()
  })

  it('still notifies when AudioContext throws', () => {
    const { ctor } = stubNotification('granted')
    expect(() => alertSessionEnd('Work')).not.toThrow()
    expect(ctor).toHaveBeenCalled()
  })
})

describe('prepareAlerts', () => {
  beforeEach(() => vi.stubGlobal('AudioContext', throwing))

  it('asks for permission only while it is default', () => {
    expect(stubNotification('default').requestPermission).toHaveBeenCalledTimes(0)
    const fresh = stubNotification('default')
    prepareAlerts()
    expect(fresh.requestPermission).toHaveBeenCalledTimes(1)
    for (const permission of ['granted', 'denied']) {
      const answered = stubNotification(permission)
      prepareAlerts()
      expect(answered.requestPermission).not.toHaveBeenCalled()
    }
  })

  it('does not throw when both are missing or throw', () => {
    vi.stubGlobal('Notification', undefined)
    expect(prepareAlerts).not.toThrow()
    const { requestPermission } = stubNotification('default')
    requestPermission.mockImplementation(throwing)
    expect(prepareAlerts).not.toThrow()
  })
})

describe('sound', () => {
  const pitches: number[] = []
  class FakeAudio {
    currentTime = 0
    destination = {}
    resume = () => Promise.resolve()
    createOscillator = () => ({
      frequency: {
        setValueAtTime: (pitch: number) => pitches.push(pitch),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: (next: unknown) => next,
      start: vi.fn(),
      stop: vi.fn(),
    })
    createGain = () => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })
  }

  beforeEach(() => {
    pitches.length = 0
    vi.stubGlobal('AudioContext', FakeAudio)
  })

  it('rises before Work and falls before a break, and still notifies', () => {
    const { ctor } = stubNotification('granted')
    alertSessionEnd('Work')
    expect(pitches).toEqual([...pitches].sort((a, b) => a - b))
    expect(pitches).toHaveLength(3)
    pitches.length = 0
    alertSessionEnd('Break')
    expect(pitches).toEqual([...pitches].sort((a, b) => b - a))
    expect(pitches).toHaveLength(2)
    pitches.length = 0
    alertSessionEnd('Long break')
    expect(pitches).toEqual([...pitches].sort((a, b) => b - a))
    expect(pitches).toHaveLength(3)
    expect(ctor).toHaveBeenCalledTimes(3)
  })

  it.each(END_SOUNDS.filter((id) => id !== 'none'))(
    '%s rises before Work and falls before a break',
    (id) => {
      stubNotification('granted')
      alertSessionEnd('Work', id)
      expect(pitches.length).toBe(3)
      expect(pitches).toEqual([...pitches].sort((a, b) => a - b))
      pitches.length = 0
      alertSessionEnd('Break', id)
      expect(pitches.length).toBe(2)
      expect(pitches).toEqual([...pitches].sort((a, b) => b - a))
      pitches.length = 0
      playEndSound(id)
      expect(pitches.length).toBe(3)
    },
  )

  it('stays silent with no sound chosen, and still notifies', () => {
    const { ctor } = stubNotification('granted')
    alertSessionEnd('Work', 'none')
    playEndSound('none')
    expect(pitches).toEqual([])
    expect(ctor).toHaveBeenCalledTimes(1)
  })

  it('plays a click on Start and one drop for each falling drop when watering', () => {
    stubNotification('granted')
    prepareAlerts()
    expect(pitches).toHaveLength(1)
    pitches.length = 0
    playWaterSound()
    expect(pitches).toHaveLength(7)
  })
})
