// The mathematics of the descent scene — pure, DOM-free, fully unit-tested.
//
// The page's backdrop is one honest optimization run: a fixed analytic loss
// f: R³ → R (two gaussian wells over a weak quadratic bowl with sinusoidal
// ridges), its negative gradient as the field, and a plain gradient-descent
// trajectory from a high-loss start to the global minimum. The visitor's
// scroll position parameterizes where the camera rides along that trajectory
// (specs/gradient-descent). This module computes; DescentScene.tsx draws.

export interface Vec3 {
  x: number
  y: number
  z: number
}

interface Well {
  center: Vec3
  depth: number
  sigma: number
}

// ─── The objective ────────────────────────────────────────────────────────────
// One deep global basin, one shallower local trap, a weak bowl keeping the
// field descending inward, and ridge ripples so the field is never boring.

const WELLS: Well[] = [
  { center: { x: 1.6, y: -0.9, z: -1.1 }, depth: 1, sigma: 1.1 }, // the global basin
  { center: { x: -2.2, y: 0.8, z: 1.6 }, depth: 0.62, sigma: 0.9 }, // a local trap
]

export const BASIN_CENTER: Vec3 = WELLS[0].center
// Chosen so the run skirts the local trap and converges in the global basin
// (asserted by the trajectory tests).
export const START: Vec3 = { x: 3.8, y: 3.2, z: -2.6 }

const BOWL = 0.03
const RIDGE = 0.12
const RIDGE_KX = 1.4
const RIDGE_KZ = 1.1

export function loss(p: Vec3): number {
  let value = BOWL * (p.x * p.x + p.y * p.y + p.z * p.z)
  value += RIDGE * Math.sin(RIDGE_KX * p.x) * Math.sin(RIDGE_KZ * p.z)
  for (const well of WELLS) {
    const dx = p.x - well.center.x
    const dy = p.y - well.center.y
    const dz = p.z - well.center.z
    const sigma2 = well.sigma * well.sigma
    value -= well.depth * Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * sigma2))
  }
  return value
}

export function gradLoss(p: Vec3): Vec3 {
  let gx = 2 * BOWL * p.x + RIDGE * RIDGE_KX * Math.cos(RIDGE_KX * p.x) * Math.sin(RIDGE_KZ * p.z)
  let gy = 2 * BOWL * p.y
  let gz = 2 * BOWL * p.z + RIDGE * RIDGE_KZ * Math.sin(RIDGE_KX * p.x) * Math.cos(RIDGE_KZ * p.z)
  for (const well of WELLS) {
    const dx = p.x - well.center.x
    const dy = p.y - well.center.y
    const dz = p.z - well.center.z
    const sigma2 = well.sigma * well.sigma
    const magnitude =
      (well.depth * Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * sigma2))) / sigma2
    gx += magnitude * dx
    gy += magnitude * dy
    gz += magnitude * dz
  }
  return { x: gx, y: gy, z: gz }
}

/** The field: the negative gradient, normalized to a unit direction. */
export function descentDirection(p: Vec3): Vec3 {
  const g = gradLoss(p)
  const length = Math.hypot(g.x, g.y, g.z)
  if (length < 1e-9) return { x: 0, y: 0, z: 0 }
  return { x: -g.x / length, y: -g.y / length, z: -g.z / length }
}

/**
 * The field restricted to the current slice: the xz projection of −∇f,
 * renormalized. Dashes seeded on the slice flow downhill along it.
 */
export function sliceFlowDirection(p: Vec3): { dx: number; dz: number } {
  const g = gradLoss(p)
  const length = Math.hypot(g.x, g.z)
  if (length < 1e-9) return { dx: 0, dz: 0 }
  return { dx: -g.x / length, dz: -g.z / length }
}

// ─── The surface slice ────────────────────────────────────────────────────────
// f lives in 4D (three parameters, one loss), so the figure shows the slice
// through the optimizer's current y, drawn as a height-field wireframe —
// higher loss, higher ground. The trajectory and the dashes are drawn on the
// same slice, so everything the visitor sees agrees.

export const SURFACE_SCALE = 0.85 // world units of height per unit of loss
const LOSS_FLOOR = -1 // ≈ the global minimum; anchors the surface near height 0

export function surfacePoint(p: Vec3): Vec3 {
  return { x: p.x, y: p.y + SURFACE_SCALE * (loss(p) - LOSS_FLOOR), z: p.z }
}

// ─── The trajectory ───────────────────────────────────────────────────────────
// Plain gradient descent from a fixed start with a fixed step size — the loss
// can only fall, which the tests assert.

const LEARNING_RATE = 0.06
const DESCENT_STEPS = 360

export interface Trajectory {
  points: Vec3[] // the raw parameter-space run
  arcLengths: number[] // arcLengths[i] = distance from points[0] to points[i]
  totalLength: number
}

export function buildTrajectory(): Trajectory {
  const points: Vec3[] = [START]
  let p = START
  for (let step = 0; step < DESCENT_STEPS; step++) {
    const g = gradLoss(p)
    p = {
      x: p.x - LEARNING_RATE * g.x,
      y: p.y - LEARNING_RATE * g.y,
      z: p.z - LEARNING_RATE * g.z,
    }
    points.push(p)
  }
  const arcLengths = [0]
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
      points[i].z - points[i - 1].z,
    )
    arcLengths.push(total)
  }
  return { points, arcLengths, totalLength: total }
}

/** The raw parameter-space point at fraction s ∈ [0, 1] of the run's arc. */
export function pointAt(traj: Trajectory, sRaw: number): Vec3 {
  const s = Math.min(1, Math.max(0, sRaw))
  const target = s * traj.totalLength
  const last = traj.points.length - 1
  let i = 0
  while (i < last - 1 && traj.arcLengths[i + 1] <= target) i += 1
  const span = traj.arcLengths[i + 1] - traj.arcLengths[i]
  const f = span > 1e-12 ? (target - traj.arcLengths[i]) / span : 0
  const a = traj.points[i]
  const b = traj.points[i + 1]
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f }
}

// ─── The camera ───────────────────────────────────────────────────────────────
// The camera rides the run: hovering above the path a little behind the
// current point, looking at a point a little ahead of it. The traversed path
// stretches away behind the current point, the dotted remainder ahead.

export interface CameraPose {
  position: Vec3
  forward: Vec3 // unit
  up: Vec3 // unit, orthogonal to forward
  right: Vec3 // unit, orthogonal to both
}

const BACK_OFFSET = 0.06 // the camera rides this far behind the current point (fraction of arc)
const AHEAD_OFFSET = 0.05 // and looks at this far ahead of it
const RISE = 1.6 // hovering above the path, so the surface fills the lower frame

export function poseAt(traj: Trajectory, sRaw: number): CameraPose {
  const s = Math.min(1, Math.max(0, sRaw))
  const anchor = surfacePoint(pointAt(traj, s - BACK_OFFSET))
  const target = surfacePoint(pointAt(traj, Math.min(1, s + AHEAD_OFFSET)))
  const position: Vec3 = { x: anchor.x, y: anchor.y + RISE, z: anchor.z }

  let forward = sub(target, position)
  let length = Math.hypot(forward.x, forward.y, forward.z)
  if (length < 1e-9) {
    forward = { x: 0, y: -1, z: 0 } // degenerate (fully converged) — look straight down
    length = 1
  }
  forward = { x: forward.x / length, y: forward.y / length, z: forward.z / length }

  // World-up made orthogonal to the view direction.
  let up: Vec3 = {
    x: -forward.x * forward.y,
    y: 1 - forward.y * forward.y,
    z: -forward.z * forward.y,
  }
  if (Math.hypot(up.x, up.y, up.z) < 1e-9) up = { x: 1, y: 0, z: 0 }
  up = normalize(up)

  const right = normalize(cross(up, forward))
  return { position, forward, up, right }
}

// ─── The projection ───────────────────────────────────────────────────────────

export const NEAR_PLANE = 0.2
const FOCAL_RATIO = 0.62 // ≈ 54° vertical FOV on the shorter viewport side

export interface Projected {
  x: number
  y: number
  depth: number // camera-space distance along the view direction
}

export function projectPoint(
  p: Vec3,
  pose: CameraPose,
  viewport: { width: number; height: number },
): Projected | null {
  const d = sub(p, pose.position)
  const depth = d.x * pose.forward.x + d.y * pose.forward.y + d.z * pose.forward.z
  if (depth < NEAR_PLANE) return null
  const cx = d.x * pose.right.x + d.y * pose.right.y + d.z * pose.right.z
  const cy = d.x * pose.up.x + d.y * pose.up.y + d.z * pose.up.z
  const focal = FOCAL_RATIO * Math.min(viewport.width, viewport.height)
  return {
    x: viewport.width / 2 + (focal * cx) / depth,
    y: viewport.height / 2 - (focal * cy) / depth,
    depth,
  }
}

/**
 * Pixels per world unit at a camera-space depth — the perspective scale.
 * Unlike measuring on screen between two projected points, this is immune to
 * foreshortening (a segment pointing away from the camera measures almost
 * zero on screen while spanning real world units).
 */
export function projectionScale(
  depth: number,
  viewport: { width: number; height: number },
): number {
  const focal = FOCAL_RATIO * Math.min(viewport.width, viewport.height)
  return focal / Math.max(depth, NEAR_PLANE)
}

// ─── The scroll timeline ──────────────────────────────────────────────────────
// The whole document is one optimization run — no section-band anchoring.

export function scrollProgress(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) return 0
  return Math.min(1, Math.max(0, scrollY / maxScroll))
}

// ─── Vector helpers ───────────────────────────────────────────────────────────

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / length, y: v.y / length, z: v.z / length }
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}
