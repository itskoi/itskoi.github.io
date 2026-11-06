import { describe, expect, it } from 'vitest'
import {
  buildField,
  DISK_INK,
  diskDot,
  dotPitch,
  INK_COUNT,
  placeFigure,
  RING_INK,
  STAR_INK,
  shadeField,
  viewportScale,
} from './blackHoleField'

const COLS = 120
const ROWS = 80
const HOLE_COL = COLS / 2
const HOLE_ROW = ROWS / 2
const RING_RADIUS = 10.5 * 1.04

const shade = (t: number) => {
  const field = buildField(COLS, ROWS, 1)
  shadeField(field, t, HOLE_COL, HOLE_ROW)
  return field.inks
}

const at = (col: number, row: number) => row * COLS + col

const countDiffs = (a: Uint8Array, b: Uint8Array, include: (ink: number) => boolean) => {
  let diffs = 0
  for (let cell = 0; cell < a.length; cell++)
    if (include(a[cell]) && a[cell] !== b[cell]) diffs += 1
  return diffs
}

const isDisk = (ink: number) => ink >= DISK_INK
const isStar = (ink: number) => ink >= STAR_INK && ink < DISK_INK

describe('shadeField', () => {
  it('is deterministic, and writes only known inks', () => {
    const inks = shade(3)
    expect(shade(3)).toEqual(inks)
    for (const ink of inks) expect(ink).toBeLessThan(INK_COUNT)
  })

  it('leaves the shadow empty and rings it with large disk dots', () => {
    const inks = shade(2)
    expect(inks[at(HOLE_COL, HOLE_ROW)]).toBe(0)
    let ringDots = 0
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const radius = Math.hypot(col + 0.5 - HOLE_COL, row + 0.5 - HOLE_ROW)
        if (Math.abs(radius - RING_RADIUS) > 0.2) continue
        ringDots += 1
        expect(inks[at(col, row)]).toBeGreaterThanOrEqual(DISK_INK + 10)
      }
    }
    expect(ringDots).toBeGreaterThan(10)
  })

  it('marks patches of the ring pink, leaves the rest white, and swirls them with the disk', () => {
    const pinkDots = (inks: Uint8Array) => inks.filter((ink) => ink >= RING_INK).length
    const whiteRingDots = (inks: Uint8Array) => {
      let dots = 0
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const radius = Math.hypot(col + 0.5 - HOLE_COL, row + 0.5 - HOLE_ROW)
          const ink = inks[at(col, row)]
          if (row < HOLE_ROW && Math.abs(radius - RING_RADIUS) < 0.5 && ink >= DISK_INK + 9)
            dots += ink < RING_INK ? 1 : 0
        }
      }
      return dots
    }
    for (const t of [0, 2, 5]) {
      const inks = shade(t)
      expect(pinkDots(inks)).toBeGreaterThan(5)
      expect(whiteRingDots(inks)).toBeGreaterThan(5)
    }
    const isPink = (ink: number) => ink >= RING_INK
    expect(countDiffs(shade(1), shade(3), isPink)).toBeGreaterThan(0)
  })

  it('keeps the ring thin: bright dots stay within 2.5 units across the upper arc', () => {
    for (const t of [0, 2, 5]) {
      const inks = shade(t)
      for (let degrees = 200; degrees <= 340; degrees += 20) {
        const angle = (degrees * Math.PI) / 180
        let bright = 0
        for (let radius = 10; radius < 23; radius += 0.5) {
          const col = Math.floor(HOLE_COL + Math.cos(angle) * radius)
          const row = Math.floor(HOLE_ROW + Math.sin(angle) * radius)
          if (inks[at(col, row)] >= DISK_INK + 9) bright += 0.5
        }
        expect(bright).toBeGreaterThan(0)
        expect(bright).toBeLessThanOrEqual(2.5)
      }
    }
  })

  it.each([0.83, 1])('keeps the ring unbroken on a coarse phone grid (scale %d)', (scale) => {
    const field = buildField(COLS, ROWS, scale)
    shadeField(field, 2, HOLE_COL, HOLE_ROW)
    for (let degrees = 180; degrees <= 360; degrees += 2) {
      const angle = (degrees * Math.PI) / 180
      let brightest = 0
      for (let radius = 10.3; radius <= 11.5; radius += 0.1) {
        const col = Math.floor(HOLE_COL + Math.cos(angle) * radius * scale)
        const row = Math.floor(HOLE_ROW + Math.sin(angle) * radius * scale)
        brightest = Math.max(brightest, field.inks[at(col, row)])
      }
      expect(brightest).toBeGreaterThanOrEqual(DISK_INK + 6)
    }
  })

  it('draws all three kinds of star', () => {
    const field = buildField(240, 150, 1.3)
    shadeField(field, 2, 158, 69)
    for (let kind = 0; kind < 3; kind++) {
      expect(field.inks.filter((ink) => ink === STAR_INK + kind).length).toBeGreaterThan(5)
    }
  })

  it("shows about as many stars as the source's frame, roughly 100, on a laptop's grid", () => {
    const field = buildField(240, 150, 1.3)
    shadeField(field, 2, 158, 69)
    const stars = field.inks.filter(isStar).length
    expect(stars).toBeGreaterThan(60)
    expect(stars).toBeLessThan(150)
  })

  it('draws the disk, the stars, and a field that leaves clear space', () => {
    const inks = shade(2)
    expect(inks.filter(isDisk).length).toBeGreaterThan(200)
    expect(inks.filter(isStar).length).toBeGreaterThan(10)
    expect(inks.filter((ink) => ink > 0 && ink < STAR_INK).length).toBeGreaterThan(100)
    expect(inks.filter((ink) => ink === 0).length).toBeGreaterThan(COLS * ROWS * 0.1)
  })

  it('holds the shadow still while the disk swirls and the stars drift', () => {
    const a = shade(1)
    const b = shade(1.5)
    expect(countDiffs(a, b, isStar)).toBeGreaterThan(10)
    expect(countDiffs(a, b, isDisk)).toBeGreaterThan(100)
    expect(b[at(HOLE_COL, HOLE_ROW)]).toBe(0)
    expect(b[at(HOLE_COL - 3, HOLE_ROW - 3)]).toBe(0)
  })

  it('loops the disk every 7s without a jump', () => {
    const a = shade(1)
    const dots = a.filter(isDisk).length
    expect(countDiffs(a, shade(8), isDisk)).toBeLessThan(dots * 0.01)
    expect(countDiffs(a, shade(4.5), isDisk)).toBeGreaterThan(dots * 0.2)
  })

  it('follows the hole when it moves', () => {
    const field = buildField(COLS, ROWS, 1)
    shadeField(field, 2, 20, 20)
    expect(field.inks[at(20, 20)]).toBe(0)
    expect(field.inks[at(HOLE_COL, HOLE_ROW)]).toBeGreaterThan(0)
  })
})

describe('diskDot', () => {
  const area = (level: number) => diskDot(level).radius ** 2

  it("follows the source's halftone tone: specks when dim, full dots when hot", () => {
    expect(area(3) / area(17)).toBeLessThan(0.05) // v about 0.2, the source's tone is 0.035
    expect(area(9) / area(17)).toBeGreaterThan(0.3)
    expect(area(9) / area(17)).toBeLessThan(0.5)
    expect(area(15) / area(17)).toBeGreaterThan(0.85)
  })

  it('grows and heats steadily, and keeps the top dots distinct, not merged', () => {
    for (let level = 1; level < 18; level++) {
      expect(diskDot(level).radius).toBeGreaterThan(diskDot(level - 1).radius)
      expect(diskDot(level).heat).toBeGreaterThanOrEqual(diskDot(level - 1).heat)
    }
    expect(diskDot(17).radius).toBeLessThanOrEqual(0.52)
  })

  it('stays pure accent until the hot end, which reaches full heat', () => {
    expect(diskDot(8).heat).toBe(0)
    expect(diskDot(17).heat).toBe(1)
  })
})

describe('dotPitch', () => {
  it('keeps at least 4px and never exceeds 240 columns', () => {
    expect(dotPitch(390)).toBe(4)
    expect(dotPitch(1440)).toBe(6)
    expect(dotPitch(3840)).toBe(16)
  })
})

describe('viewportScale', () => {
  const diskWidth = (width: number, height: number) => viewportScale(width, height) * 92

  it('spans half a wide screen and most of a phone', () => {
    expect(diskWidth(1440, 900)).toBeCloseTo(720)
    expect(diskWidth(390, 844)).toBeCloseTo(390 * 0.95)
  })

  it('never outgrows a short, wide screen', () => {
    expect(diskWidth(3440, 1000)).toBeCloseTo(900)
  })
})

describe('placeFigure', () => {
  it('sits right of the hero text on wide screens, centered on phones', () => {
    expect(placeFigure(1440, 900, false, 80)).toEqual({ x: 1440 * 0.66, y: 900 * 0.46 })
    expect(placeFigure(390, 844, false, 20)).toEqual({ x: 195, y: 422 })
  })

  it('clears the illustration stage during Experience', () => {
    expect(placeFigure(1440, 900, true, 80)).toEqual({ x: (720 + 80) / 2, y: 450 })
    expect(placeFigure(390, 844, true, 20).y).toBeCloseTo(844 * 0.72)
  })
})
