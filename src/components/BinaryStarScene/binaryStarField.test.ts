import { describe, expect, it } from 'vitest'
import {
  buildOrbits,
  discDot,
  HEAVY_RADIUS,
  HEAVY_SHARE,
  haloStrength,
  LIGHT_RADIUS,
  LIGHT_SHARE,
  ORBIT_SAMPLES,
  placeFigure,
  viewportScale,
} from './binaryStarField'

const { heavy, light, centerOfMass } = buildOrbits()

const stepLength = (orbit: Float32Array, a: number, b: number) =>
  Math.hypot(orbit[a * 2] - orbit[b * 2], orbit[a * 2 + 1] - orbit[b * 2 + 1])

const separation = (i: number) =>
  Math.hypot(heavy[i * 2] - light[i * 2], heavy[i * 2 + 1] - light[i * 2 + 1])

const bounds = (axis: number) => {
  const values: number[] = []
  for (const orbit of [heavy, light]) {
    for (let i = axis; i < orbit.length; i += 2) values.push(orbit[i])
  }
  return { min: Math.min(...values), max: Math.max(...values) }
}

describe('buildOrbits', () => {
  it('keeps the stars on opposite sides of a fixed centre of mass', () => {
    const massHeavy = LIGHT_SHARE
    const massLight = HEAVY_SHARE
    for (let i = 0; i < ORBIT_SAMPLES; i += 27) {
      for (const [axis, center] of [centerOfMass[0], centerOfMass[1]].entries()) {
        const weighted = heavy[i * 2 + axis] * massHeavy + light[i * 2 + axis] * massLight
        expect(weighted).toBeCloseTo(center, 4)
      }
    }
  })

  it('gives the lighter star the wider orbit', () => {
    const reach = (orbit: Float32Array) => {
      let furthest = 0
      for (let i = 0; i < orbit.length; i += 2) {
        furthest = Math.max(
          furthest,
          Math.hypot(orbit[i] - centerOfMass[0], orbit[i + 1] - centerOfMass[1]),
        )
      }
      return furthest
    }
    expect(reach(light)).toBeGreaterThan(reach(heavy) * 2)
  })

  it('speeds up at closest approach, as Kepler says', () => {
    let closest = 0
    let farthest = 0
    for (let i = 0; i < ORBIT_SAMPLES; i++) {
      if (separation(i) < separation(closest)) closest = i
      if (separation(i) > separation(farthest)) farthest = i
    }
    const pace = (i: number) => stepLength(light, i, (i + 1) % ORBIT_SAMPLES)
    expect(pace(closest)).toBeGreaterThan(pace(farthest) * 2)
  })

  it('never overlaps the two discs, so neither needs to draw in front', () => {
    for (let i = 0; i < ORBIT_SAMPLES; i++) {
      expect(separation(i)).toBeGreaterThan(HEAVY_RADIUS + LIGHT_RADIUS)
    }
  })

  it('closes its loop, so the stars never jump', () => {
    let largest = 0
    for (let i = 1; i < ORBIT_SAMPLES; i++) largest = Math.max(largest, stepLength(light, i - 1, i))
    expect(stepLength(light, ORBIT_SAMPLES - 1, 0)).toBeLessThanOrEqual(largest)
  })

  it('centers the figure on the origin, within the size placement assumes', () => {
    const x = bounds(0)
    const y = bounds(1)
    expect(x.min + x.max).toBeCloseTo(0, 4)
    expect(y.min + y.max).toBeCloseTo(0, 4)
    expect(x.max - x.min).toBeLessThanOrEqual(1.6)
    expect(y.max - y.min).toBeLessThanOrEqual(0.9)
  })
})

describe('haloStrength', () => {
  it('fades from the surface outward and stops at 4 radii', () => {
    expect(haloStrength(0.5)).toBe(0)
    expect(haloStrength(1)).toBe(0.5)
    expect(haloStrength(2)).toBeLessThan(haloStrength(1))
    expect(haloStrength(4)).toBeGreaterThan(0)
    expect(haloStrength(4.01)).toBe(0)
  })
})

describe('discDot', () => {
  it('shrinks from the centre to the rim, and its dots never touch', () => {
    expect(discDot(0.5)).toBeLessThan(discDot(0))
    expect(discDot(1)).toBeLessThan(discDot(0.5))
    expect(discDot(1)).toBeGreaterThan(0)
    expect(discDot(0)).toBeLessThan(0.5)
  })
})

describe('placement', () => {
  const left = 80

  it('sits right of center on wide screens', () => {
    expect(placeFigure(1440, 900, false, left).x).toBeGreaterThan(720)
  })

  it('moves to the middle of the text column during Experience on wide screens', () => {
    expect(placeFigure(1440, 900, true, left)).toEqual({ x: 400, y: 450 })
  })

  it('moves below the pinned stage during Experience on phones', () => {
    const { x, y } = placeFigure(390, 844, true, 20)
    expect(x).toBe(195)
    expect(y).toBeGreaterThan(844 * 0.6)
  })

  it('fits the figure inside the text column on wide screens and the width on phones', () => {
    const width = bounds(0).max - bounds(0).min
    const height = bounds(1).max - bounds(1).min
    expect(viewportScale(1440, 900) * width).toBeLessThanOrEqual(1440 * 0.45)
    expect(viewportScale(1440, 900) * height).toBeLessThanOrEqual(900 * 0.85)
    expect(viewportScale(390, 844) * width).toBeLessThanOrEqual(390)
  })
})
