// The flow-field math — the physics engine of the scene, as pure functions.
//
// Nothing in this file touches the DOM, the canvas, or any state; given identical
// inputs every function returns identical outputs. That purity is what makes the
// whole scene testable: the invariants below (no flow through a body, zero speed
// at the stagnation poles, double speed at the crown, circulation around each
// vortex) are asserted directly in flowField.test.ts.
//
// The model is "potential flow": wind + obstacles + vortices superposed pointwise.
// There is no time-stepping simulation anywhere — time enters only as an argument.

// A 2D vector / point. y grows downward (canvas coordinates).

export interface Vec {
  x: number
  y: number
}

// A circular obstacle in the field. Used for the planet, the moon, and in tests.

export interface Cylinder {
  cx: number
  cy: number
  radius: number
}

// A point vortex: pure rotation around (x, y). The sign of `circulation` (Γ)
// decides the spin direction; its magnitude is the loop integral of the velocity
// around the vortex — the physical definition of circulation.

export interface Vortex {
  x: number
  y: number
  circulation: number
}

// Everything the flow "knows" at one instant. Assembled fresh each frame by
// FlowScene, then only read.

export interface FlowField {
  U: number // free-stream (wind) speed, pointing along +x
  bodies: readonly Cylinder[] // obstacles that deflect the flow (planet, moon)
  vortices: readonly Vortex[] // the street; empty when strength is 0
  vortexCore: number // regularization radius — see vortexVelocity
}

// Document-space positions of the content sections — the anchors the scroll
// choreography is pinned to.

export interface ScrollMarkers {
  experienceTop: number
  educationTop: number
  publicationsTop: number
  viewportHeight: number
}

// The scroll-driven progress values, each eased into 0..1.

export interface FlowTimeline {
  shed: number // ramps up across Experience entry: vortices start peeling off
  street: number // combined street strength = shed × (1 − exit): holds through Education
  exit: number // ramps up at Publications: circulation and the planet decay
}

// Inputs to streetVortices — sizes and rates for the vortex street.

export interface StreetParams {
  time: number
  strength: number
  cylinder: Cylinder
  U: number
  count: number
  spacing: number
  rowOffset: number
  drift: number
  viewportWidth: number
}

export interface StreamlineBounds {
  width: number
  height: number
}

// The result of tracing one streamline: the polyline to stroke, and the mean
// field speed along it (used to advance the dash pattern).

export interface Streamline {
  points: Vec[]
  meanSpeed: number
}

const SPAWN_GAP_RATIO = 1.1 // vortices are born 2.1 planet radii downstream (1 + this)
const CIRCULATION_RATIO = 1.5 // vortex strength Γ = 1.5 · 2πUR — tuned by screenshot review
// Vortex influence is local to the wake: it fades out between 14× and 26× the core
// radius so the street reads as a wake event, not global waviness.
const REACH_NEAR_RATIO = 14
const REACH_FAR_RATIO = 26
const STEP = 6 // integration step length in px
const MAX_STEPS = 800 // step budget: enough to cross the screen with weave to spare
const BOUNDS_PAD = 24 // lines may overshoot the viewport by this much before stopping
// Streamlines keep a visible air gap off every body — a line kissing the ring
// reads as a hit even when it never crosses. The standoff scales with the body.
const STANDOFF_RATIO = 1.12
const STANDOFF_MIN = 2

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

// Ease from 0 to 1 across [edge0, edge1] with zero slope at both ends — the
// standard smooth ramp used for every band transition.

function smoothstep(edge0: number, edge1: number, v: number): number {
  const t = clamp01((v - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/**
 * Uniform flow past one circular body — the exact textbook solution (free stream
 * + a doublet at the center). This is the only component that "knows" the body is
 * solid: on the surface r = R the radial velocity is exactly zero, speed is zero
 * at the upstream/downstream poles (stagnation points) and 2U at the crown —
 * which is why streamlines split, squeeze, and rejoin around the planet.
 *
 * Far from the body the doublet term decays as 1/r², leaving plain (U, 0).
 */
export function cylinderVelocity(c: Cylinder, U: number, x: number, y: number): Vec {
  const dx = x - c.cx
  const dy = y - c.cy
  const r2 = dx * dx + dy * dy
  const inv = (c.radius * c.radius) / (r2 * r2)
  return {
    x: U * (1 - inv * (dx * dx - dy * dy)),
    y: -U * 2 * inv * dx * dy,
  }
}

/**
 * The velocity induced by a set of point vortices, summed. Each vortex spins the
 * flow around itself with speed Γ/2πr; the `core` radius regularizes the term
 * (r² + core² in place of r²) so points near the center stay finite instead of
 * blowing up — the price is that circulation is exact only on loops of a few
 * core radii or more. The reach falloff zeroes out influence far from the wake
 * so distant streamlines stay laminar.
 */
export function vortexVelocity(
  vortices: readonly Vortex[],
  x: number,
  y: number,
  core: number,
): Vec {
  let vx = 0
  let vy = 0
  const core2 = core * core
  const near = core * REACH_NEAR_RATIO
  const far = core * REACH_FAR_RATIO
  for (const v of vortices) {
    const dx = x - v.x
    const dy = y - v.y
    const d2 = dx * dx + dy * dy
    const influence = 1 - smoothstep(near, far, Math.sqrt(d2))
    const k = ((v.circulation / (2 * Math.PI)) * influence) / (d2 + core2)
    vx += -k * dy
    vy += k * dx
  }
  return { x: vx, y: vy }
}

/**
 * The whole flow at one point: wind + every body's deflection + every vortex.
 * Superposition — components are simply added. Each body contributes its doublet
 * only (v − U strips the uniform part, so N bodies still carry exactly one free
 * stream). The field is steady: it depends on where the bodies and vortices are,
 * never on the clock.
 */
export function fieldVelocity(f: FlowField, x: number, y: number): Vec {
  let vx = f.U
  let vy = 0
  for (const body of f.bodies) {
    const v = cylinderVelocity(body, f.U, x, y)
    vx += v.x - f.U
    vy += v.y
  }
  const swirl = vortexVelocity(f.vortices, x, y, f.vortexCore)
  vx += swirl.x
  vy += swirl.y
  return { x: vx, y: vy }
}

/**
 * The Kármán street as a pure function of time — no stored state, ever. Vortex
 * k's age is derived from the clock: vortices spawn behind the planet every
 * `spacing / drift` seconds, alternate top/bottom rows with opposite spin, and
 * march downstream at `drift`. Each one fades in near the spawn point and out as
 * it approaches the right edge. The same `time` always produces the same street.
 */
export function streetVortices(p: StreetParams): Vortex[] {
  if (p.strength <= 0) return []
  const c = p.cylinder
  const period = p.spacing / p.drift
  const spawnIndex = Math.floor(p.time / period)
  const gammaMax = 2 * Math.PI * p.U * c.radius * CIRCULATION_RATIO
  const spawnX = c.cx + c.radius * (1 + SPAWN_GAP_RATIO)
  const exitStart = p.viewportWidth - c.radius * 3
  const exitEnd = p.viewportWidth + c.radius * 2
  const out: Vortex[] = []
  for (let k = 0; k < p.count; k += 1) {
    const n = spawnIndex - k
    const age = p.time - n * period
    const x = spawnX + age * p.drift
    if (x > exitEnd) continue
    const fade = 1 - smoothstep(exitStart, exitEnd, x)
    const top = n % 2 === 0
    const circulation = (top ? gammaMax : -gammaMax) * p.strength * fade
    if (Math.abs(circulation) < 1e-6) continue
    out.push({ x, y: c.cy + (top ? -p.rowOffset / 2 : p.rowOffset / 2), circulation })
  }
  return out
}

/**
 * Scroll position → the story beats. Each band is a smoothstep anchored to
 * a section top (offset by fractions of a viewport height so transitions begin
 * just before a section arrives and finish just after). `street` is derived:
 * it can only be as strong as the shed ramp allows, and the exit ramp kills it.
 */
export function flowTimeline(scrollY: number, m: ScrollMarkers): FlowTimeline {
  const vh = m.viewportHeight
  const shed = smoothstep(m.experienceTop - vh * 0.9, m.experienceTop + vh * 0.6, scrollY)
  const exit = smoothstep(m.publicationsTop - vh * 0.3, m.publicationsTop + vh * 0.8, scrollY)
  return { shed, street: shed * (1 - exit), exit }
}

/**
 * Trace one streamline: from the seed, repeatedly step STEP px in the direction
 * the field points. This uses the RK2 (midpoint) scheme — sample the field at
 * the seed, look half a step ahead, and use the direction *there* for the full
 * step — which follows curved flow far more accurately than a plain Euler step
 * of the same size. The walk ends at the far edge, off-screen, at a stagnation
 * point (speed ≈ 0), or when the step budget runs out.
 */
export function integrateStreamline(
  f: FlowField,
  x0: number,
  y0: number,
  bounds: StreamlineBounds,
): Streamline {
  const points: Vec[] = [{ x: x0, y: y0 }]
  let x = x0
  let y = y0
  let speedSum = 0
  let count = 0
  for (let i = 0; i < MAX_STEPS; i += 1) {
    const v = fieldVelocity(f, x, y)
    const speed = Math.hypot(v.x, v.y)
    if (speed < 1e-6) break
    speedSum += speed
    count += 1
    const hx = (v.x / speed) * (STEP / 2)
    const hy = (v.y / speed) * (STEP / 2)
    const mid = fieldVelocity(f, x + hx, y + hy)
    const midSpeed = Math.hypot(mid.x, mid.y)
    if (midSpeed < 1e-6) break
    x += (mid.x / midSpeed) * STEP
    y += (mid.y / midSpeed) * STEP
    // Superposed vortices do not respect the walls (no image vortices), so a step
    // can land inside a body — project it back outside the standoff; the line
    // then bends around the body and releases tangentially, like flow around it.
    for (const body of f.bodies) {
      const dx = x - body.cx
      const dy = y - body.cy
      const d = Math.hypot(dx, dy)
      const min = body.radius * STANDOFF_RATIO + STANDOFF_MIN
      if (d < min) {
        const scale = d > 1e-6 ? min / d : 0
        x = body.cx + dx * scale
        y = body.cy + dy * scale
      }
    }
    points.push({ x, y })
    if (x > bounds.width + BOUNDS_PAD || y < -BOUNDS_PAD || y > bounds.height + BOUNDS_PAD) break
  }
  return { points, meanSpeed: count > 0 ? speedSum / count : 0 }
}
