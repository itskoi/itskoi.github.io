export interface Vec {
  x: number
  y: number
}

export interface Cylinder {
  cx: number
  cy: number
  radius: number
}

export interface Vortex {
  x: number
  y: number
  circulation: number
}

export interface FlowField {
  U: number
  cylinder: Cylinder | null
  vortices: readonly Vortex[]
  vortexCore: number
  wobble: number
  wobbleWavelength: number
  wobbleOmega: number
}

export interface ScrollMarkers {
  experienceTop: number
  educationTop: number
  publicationsTop: number
  viewportHeight: number
}

export interface FlowTimeline {
  settle: number
  shed: number
  street: number
  exit: number
}

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

export interface Streamline {
  points: Vec[]
  meanSpeed: number
}

const WOBBLE_AMPLITUDE = 0.22
const SPAWN_GAP_RATIO = 1.1
const CIRCULATION_RATIO = 0.9
const STEP = 6
const MAX_STEPS = 420
const BOUNDS_PAD = 24

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

function smoothstep(edge0: number, edge1: number, v: number): number {
  const t = clamp01((v - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

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

export function vortexVelocity(
  vortices: readonly Vortex[],
  x: number,
  y: number,
  core: number,
): Vec {
  let vx = 0
  let vy = 0
  const core2 = core * core
  for (const v of vortices) {
    const dx = x - v.x
    const dy = y - v.y
    const k = v.circulation / (2 * Math.PI) / (dx * dx + dy * dy + core2)
    vx += -k * dy
    vy += k * dx
  }
  return { x: vx, y: vy }
}

export function fieldVelocity(f: FlowField, x: number, y: number, time: number): Vec {
  const base = f.cylinder ? cylinderVelocity(f.cylinder, f.U, x, y) : { x: f.U, y: 0 }
  const swirl = vortexVelocity(f.vortices, x, y, f.vortexCore)
  let vy = base.y + swirl.y
  if (f.wobble > 0) {
    const phase = ((x / f.wobbleWavelength) * 2 - (time * f.wobbleOmega) / Math.PI) * Math.PI
    vy += f.wobble * WOBBLE_AMPLITUDE * f.U * Math.sin(phase)
  }
  return { x: base.x + swirl.x, y: vy }
}

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

export function flowTimeline(scrollY: number, m: ScrollMarkers): FlowTimeline {
  const vh = m.viewportHeight
  const settle = smoothstep(0, m.experienceTop - vh * 0.9, scrollY)
  const shed = smoothstep(m.experienceTop - vh * 0.9, m.experienceTop + vh * 0.6, scrollY)
  const exit = smoothstep(m.publicationsTop - vh * 0.3, m.publicationsTop + vh * 0.8, scrollY)
  return { settle, shed, street: shed * (1 - exit), exit }
}

export function integrateStreamline(
  f: FlowField,
  x0: number,
  y0: number,
  time: number,
  bounds: StreamlineBounds,
): Streamline {
  const points: Vec[] = [{ x: x0, y: y0 }]
  let x = x0
  let y = y0
  let speedSum = 0
  let count = 0
  for (let i = 0; i < MAX_STEPS; i += 1) {
    const v = fieldVelocity(f, x, y, time)
    const speed = Math.hypot(v.x, v.y)
    if (speed < 1e-6) break
    speedSum += speed
    count += 1
    const hx = (v.x / speed) * (STEP / 2)
    const hy = (v.y / speed) * (STEP / 2)
    const mid = fieldVelocity(f, x + hx, y + hy, time)
    const midSpeed = Math.hypot(mid.x, mid.y)
    if (midSpeed < 1e-6) break
    x += (mid.x / midSpeed) * STEP
    y += (mid.y / midSpeed) * STEP
    points.push({ x, y })
    if (x > bounds.width + BOUNDS_PAD || y < -BOUNDS_PAD || y > bounds.height + BOUNDS_PAD) break
  }
  return { points, meanSpeed: count > 0 ? speedSum / count : 0 }
}
