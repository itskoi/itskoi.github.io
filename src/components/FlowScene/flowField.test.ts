import { describe, expect, it } from 'vitest'
import {
  cylinderVelocity,
  fieldVelocity,
  flowTimeline,
  integrateStreamline,
  streetVortices,
  vortexVelocity,
} from './flowField'

const U = 10
const CYL = { cx: 400, cy: 300, radius: 60 }

describe('cylinderVelocity — potential flow past a cylinder', () => {
  it('is impermeable: no radial velocity anywhere on the surface r = R', () => {
    for (let i = 0; i < 16; i += 1) {
      const theta = (i / 16) * Math.PI * 2
      const x = CYL.cx + CYL.radius * Math.cos(theta)
      const y = CYL.cy + CYL.radius * Math.sin(theta)
      const v = cylinderVelocity(CYL, U, x, y)
      const radial = v.x * Math.cos(theta) + v.y * Math.sin(theta)
      expect(Math.abs(radial)).toBeLessThan(1e-6)
    }
  })

  it('runs at ~2U at the crown and stagnates at both poles', () => {
    const crown = cylinderVelocity(CYL, U, CYL.cx, CYL.cy + CYL.radius)
    expect(crown.x).toBeCloseTo(2 * U, 6)
    expect(crown.y).toBeCloseTo(0, 6)

    for (const pole of [CYL.cx - CYL.radius, CYL.cx + CYL.radius]) {
      const v = cylinderVelocity(CYL, U, pole, CYL.cy)
      expect(Math.hypot(v.x, v.y)).toBeLessThan(1e-6)
    }
  })

  it('returns to the free stream far from the cylinder', () => {
    const v = cylinderVelocity(CYL, U, 5000, 300)
    expect(Math.abs(v.x - U)).toBeLessThan(0.01)
    expect(Math.abs(v.y)).toBeLessThan(0.01)
  })

  it('is irrotational away from the center (discrete curl ≈ 0)', () => {
    const eps = 0.5
    for (const [px, py] of [
      [500, 340],
      [300, 260],
      [700, 300],
    ]) {
      const dvdx =
        (cylinderVelocity(CYL, U, px + eps, py).y - cylinderVelocity(CYL, U, px - eps, py).y) /
        (2 * eps)
      const dudy =
        (cylinderVelocity(CYL, U, px, py + eps).x - cylinderVelocity(CYL, U, px, py - eps).x) /
        (2 * eps)
      expect(Math.abs(dvdx - dudy)).toBeLessThan(1e-3)
    }
  })
})

describe('vortexVelocity — regularized point vortices', () => {
  const CORE = 5

  it('carries its circulation: the loop integral ≈ Γ, sign included', () => {
    const GAMMA = 40
    const steps = 720
    for (const [vx, vy, gamma] of [
      [100, 100, GAMMA],
      [100, 100, -GAMMA],
    ]) {
      const r = 25
      let integral = 0
      for (let i = 0; i < steps; i += 1) {
        const a0 = (i / steps) * Math.PI * 2
        const a1 = ((i + 1) / steps) * Math.PI * 2
        const am = (a0 + a1) / 2
        const p = { x: vx + r * Math.cos(am), y: vy + r * Math.sin(am) }
        const v = vortexVelocity([{ x: vx, y: vy, circulation: gamma }], p.x, p.y, CORE)
        integral += v.x * -(Math.sin(am) * (r * (a1 - a0))) + v.y * (Math.cos(am) * (r * (a1 - a0)))
      }
      expect(Math.abs(integral - gamma)).toBeLessThan(0.05 * Math.abs(gamma))
    }
  })

  it('superposes: a loop around one vortex ignores a distant neighbour', () => {
    const GAMMA = 40
    const vortices = [
      { x: 100, y: 100, circulation: GAMMA },
      { x: 900, y: 700, circulation: GAMMA },
    ]
    const r = 25
    const steps = 720
    let integral = 0
    for (let i = 0; i < steps; i += 1) {
      const a0 = (i / steps) * Math.PI * 2
      const a1 = ((i + 1) / steps) * Math.PI * 2
      const am = (a0 + a1) / 2
      const p = { x: 100 + r * Math.cos(am), y: 100 + r * Math.sin(am) }
      const v = vortexVelocity(vortices, p.x, p.y, CORE)
      integral += v.x * -(Math.sin(am) * (r * (a1 - a0))) + v.y * (Math.cos(am) * (r * (a1 - a0)))
    }
    expect(Math.abs(integral - GAMMA)).toBeLessThan(0.05 * GAMMA)
  })
})

describe('streetVortices — the stateless Kármán street', () => {
  const args = {
    time: 12.3,
    strength: 1,
    cylinder: CYL,
    U,
    count: 6,
    spacing: 120,
    rowOffset: 84,
    drift: 24,
    viewportWidth: 1200,
  }

  it('is empty when the street has no strength', () => {
    expect(streetVortices({ ...args, strength: 0 })).toEqual([])
  })

  it('alternates circulation sign and row side, newest nearest the obstacle', () => {
    const vortices = streetVortices(args)
    expect(vortices.length).toBeGreaterThan(3)
    for (let i = 0; i < vortices.length - 1; i += 1) {
      const a = vortices[i]
      const b = vortices[i + 1]
      expect(b.x).toBeGreaterThan(a.x)
      expect(Math.sign(b.circulation)).not.toBe(Math.sign(a.circulation))
      expect(Math.sign(b.y - CYL.cy)).not.toBe(Math.sign(a.y - CYL.cy))
    }
    expect(vortices[0].x).toBeGreaterThan(CYL.cx + CYL.radius)
  })

  it('is a pure function of its inputs', () => {
    expect(streetVortices(args)).toEqual(streetVortices(args))
  })

  it('keeps every vortex inside the exit window and caps the circulation', () => {
    for (const v of streetVortices(args)) {
      expect(v.x).toBeLessThanOrEqual(1200 + 2 * CYL.radius)
      expect(Math.abs(v.circulation)).toBeLessThanOrEqual(2 * Math.PI * U * CYL.radius)
    }
  })

  it('scales every circulation with strength (the street decays, not truncates)', () => {
    const full = streetVortices(args)
    const half = streetVortices({ ...args, strength: 0.5 })
    expect(half).toHaveLength(full.length)
    for (let i = 0; i < full.length; i += 1) {
      expect(half[i].x).toBeCloseTo(full[i].x, 9)
      expect(half[i].circulation).toBeCloseTo(full[i].circulation * 0.5, 9)
    }
  })
})

describe('flowTimeline — scroll choreography', () => {
  const markers = {
    experienceTop: 900,
    educationTop: 2600,
    publicationsTop: 4300,
    viewportHeight: 800,
  }

  it('opens laminar: full wobble, no street, obstacle present at load', () => {
    const tl = flowTimeline(0, markers)
    expect(tl.settle).toBe(0)
    expect(tl.shed).toBe(0)
    expect(tl.street).toBe(0)
    expect(tl.exit).toBe(0)
  })

  it('holds the developed street through Education', () => {
    const tl = flowTimeline(3000, markers)
    expect(tl.settle).toBe(1)
    expect(tl.shed).toBe(1)
    expect(tl.street).toBe(1)
    expect(tl.exit).toBe(0)
  })

  it('ends calm: no wobble, no street, no obstacle past the last band', () => {
    const tl = flowTimeline(6000, markers)
    expect(tl.settle).toBe(1)
    expect(tl.shed).toBe(1)
    expect(tl.street).toBe(0)
    expect(tl.exit).toBe(1)
  })

  it('clamps each band and develops the street monotonically through the middle', () => {
    const early = flowTimeline(200, markers)
    const mid = flowTimeline(500, markers)
    const late = flowTimeline(1400, markers)
    expect(early.settle).toBe(1)
    expect(early.shed).toBeGreaterThan(0)
    expect(late.shed).toBe(1)
    expect(mid.shed).toBeGreaterThan(early.shed)
    expect(late.street).toBeGreaterThan(mid.shed * 0.9)
    expect(late.street).toBeLessThanOrEqual(1)
  })
})

describe('fieldVelocity — superposition', () => {
  it('is pure uniform flow with no cylinder, no vortices, no wobble', () => {
    const f = {
      U,
      cylinder: null,
      vortices: [],
      vortexCore: 5,
      wobble: 0,
      wobbleWavelength: 200,
      wobbleOmega: 1,
    }
    const v = fieldVelocity(f, 123, 456, 7.8)
    expect(v.x).toBeCloseTo(U, 6)
    expect(v.y).toBeCloseTo(0, 6)
  })

  it('adds the cylinder and vortex components exactly', () => {
    const vortex = { x: 700, y: 300, circulation: 2 * Math.PI * U * CYL.radius * 0.9 }
    const f = {
      U,
      cylinder: CYL,
      vortices: [vortex],
      vortexCore: CYL.radius * 0.35,
      wobble: 0,
      wobbleWavelength: 200,
      wobbleOmega: 1,
    }
    const v = fieldVelocity(f, 520, 340, 3)
    const c = cylinderVelocity(CYL, U, 520, 340)
    const w = vortexVelocity([vortex], 520, 340, f.vortexCore)
    expect(v.x).toBeCloseTo(c.x + w.x, 9)
    expect(v.y).toBeCloseTo(c.y + w.y, 9)
  })

  it('weaves: the wobble term bends the field and scales with its weight', () => {
    const base = {
      U,
      cylinder: null,
      vortices: [],
      vortexCore: 5,
      wobbleWavelength: 200,
      wobbleOmega: 1,
    }
    const full = fieldVelocity({ ...base, wobble: 1 }, 50, 0, 0)
    const half = fieldVelocity({ ...base, wobble: 0.5 }, 50, 0, 0)
    expect(full.y).toBeCloseTo(U * 0.22, 6)
    expect(half.y).toBeCloseTo(full.y * 0.5, 6)
    expect(fieldVelocity({ ...base, wobble: 1 }, 0, 0, 0).y).toBeCloseTo(0, 6)
  })
})

describe('integrateStreamline', () => {
  const bounds = { width: 800, height: 600 }

  it('draws a straight horizontal line through a uniform field', () => {
    const f = {
      U,
      cylinder: null,
      vortices: [],
      vortexCore: 5,
      wobble: 0,
      wobbleWavelength: 200,
      wobbleOmega: 1,
    }
    const { points, meanSpeed } = integrateStreamline(f, 0, 100, 0, bounds)
    expect(points[0]).toEqual({ x: 0, y: 100 })
    for (const p of points) {
      expect(Math.abs(p.y - 100)).toBeLessThan(1e-6)
    }
    expect(points[points.length - 1].x).toBeGreaterThanOrEqual(bounds.width)
    expect(meanSpeed).toBeCloseTo(U, 5)
  })

  it('never crosses the obstacle and stays inside the padded viewport', () => {
    const f = {
      U,
      cylinder: CYL,
      vortices: [],
      vortexCore: 5,
      wobble: 0,
      wobbleWavelength: 200,
      wobbleOmega: 1,
    }
    const { points } = integrateStreamline(f, 0, 313, 0, bounds)
    let minDistance = Number.POSITIVE_INFINITY
    for (const p of points) {
      const d = Math.hypot(p.x - CYL.cx, p.y - CYL.cy)
      minDistance = Math.min(minDistance, d)
      expect(p.x).toBeLessThanOrEqual(bounds.width + 48)
      expect(p.y).toBeGreaterThanOrEqual(-48)
      expect(p.y).toBeLessThanOrEqual(bounds.height + 48)
    }
    expect(minDistance).toBeGreaterThan(CYL.radius - 2)
  })
})
