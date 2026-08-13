import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const readScene = vi.hoisted(() => vi.fn())
const subscribers = vi.hoisted(() => {
  const subs: Array<() => void> = []
  return {
    subs,
    onThemeChange: vi.fn((cb: () => void) => {
      subs.push(cb)
      return () => {}
    }),
  }
})

vi.mock('@/lib/theme', () => ({
  readSceneColors: readScene,
  onThemeChange: subscribers.onThemeChange,
}))

import { Background } from './Background'

const recorded: string[] = []

function makeCtx() {
  return {
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    save() {},
    restore() {},
    drawImage() {},
    setTransform() {},
    set fillStyle(v: unknown) {
      recorded.push(String(v))
    },
    set strokeStyle(v: unknown) {
      recorded.push(String(v))
    },
    set globalAlpha(_: unknown) {},
    set lineWidth(_: unknown) {},
    set globalCompositeOperation(_: unknown) {},
  } as unknown as CanvasRenderingContext2D
}

describe('Background', () => {
  beforeEach(() => {
    recorded.length = 0
    subscribers.subs.length = 0
    readScene.mockReset()
    readScene.mockReturnValue({ r: 255, g: 255, b: 255 })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(makeCtx())
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders a canvas for the night sky + geometric lines', () => {
    const { container } = render(<Background />)
    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('derives wire/node colors from readSceneColors (white figure in dark mode)', () => {
    render(<Background />)
    expect(recorded).toContain('rgba(255, 255, 255, 0.13)') // wires
    expect(recorded).toContain('rgba(255, 255, 255, 0.5)') // nodes
  })

  it('re-renders the static layer when the theme changes', () => {
    render(<Background />)
    expect(recorded).toContain('rgba(255, 255, 255, 0.13)')

    readScene.mockReturnValue({ r: 11, g: 14, b: 18 }) // ink figure in light mode
    act(() => subscribers.subs[0]?.())

    expect(recorded).toContain('rgba(11, 14, 18, 0.13)')
    expect(subscribers.onThemeChange).toHaveBeenCalled()
  })
})
