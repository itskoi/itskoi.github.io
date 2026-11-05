import { describe, expect, it } from 'vitest'
import { buildOrbit, placeFigure, projectOrbit, viewportScale } from './lorenzField'

describe('buildOrbit', () => {
  const orbit = buildOrbit()
  const count = orbit.length / 3

  it('stores xyz triples and is deterministic', () => {
    expect(orbit.length % 3).toBe(0)
    expect(count).toBeGreaterThan(4000)
    expect(buildOrbit()).toEqual(orbit)
  })

  it('stays on the attractor: bounded, finite, and visiting both wings', () => {
    let negative = 0
    let positive = 0
    for (let i = 0; i < count; i++) {
      const x = orbit[i * 3]
      const y = orbit[i * 3 + 1]
      const z = orbit[i * 3 + 2]
      expect(Math.abs(x)).toBeLessThan(25)
      expect(Math.abs(y)).toBeLessThan(35)
      expect(z).toBeGreaterThan(0)
      expect(z).toBeLessThan(55)
      if (x < 0) negative += 1
      else positive += 1
    }
    expect(negative).toBeGreaterThan(count / 5)
    expect(positive).toBeGreaterThan(count / 5)
  })

  it('closes its loop: the step back to the start is no bigger than a fast ordinary step', () => {
    const gap = (a: number, b: number) =>
      Math.hypot(
        orbit[a * 3] - orbit[b * 3],
        orbit[a * 3 + 1] - orbit[b * 3 + 1],
        orbit[a * 3 + 2] - orbit[b * 3 + 2],
      )
    let largest = 0
    for (let i = 1; i < count; i++) largest = Math.max(largest, gap(i - 1, i))
    expect(gap(count - 1, 0)).toBeLessThan(largest * 3)
  })
})

describe('projectOrbit', () => {
  const orbit = buildOrbit()
  const out = new Float32Array(orbit.length)

  it('centers the figure on the given point', () => {
    projectOrbit(orbit, 3, 10, 500, 400, out)
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < orbit.length; i += 3) {
      xs.push(out[i])
      ys.push(out[i + 1])
    }
    // The bounding box, not the mean: an orbit can spend longer on one wing.
    expect(Math.abs((Math.min(...xs) + Math.max(...xs)) / 2 - 500)).toBeLessThan(40)
    expect(Math.abs((Math.min(...ys) + Math.max(...ys)) / 2 - 400)).toBeLessThan(40)
  })

  it('turns with time', () => {
    const later = new Float32Array(orbit.length)
    projectOrbit(orbit, 0, 10, 500, 400, out)
    projectOrbit(orbit, 5, 10, 500, 400, later)
    expect(later).not.toEqual(out)
  })
})

describe('placement', () => {
  const left = 80

  it('sits right of center on wide screens', () => {
    const { x } = placeFigure(1440, 900, false, left)
    expect(x).toBeGreaterThan(720)
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
    expect(viewportScale(1440, 900) * 40).toBeLessThanOrEqual(1440 * 0.45)
    expect(viewportScale(1440, 900) * 50).toBeLessThanOrEqual(900 * 0.85)
    expect(viewportScale(390, 844) * 40).toBeLessThanOrEqual(390)
  })
})
