// The Lorenz system and how it sits on screen. Pure, so it can be tested without a canvas.

const SIGMA = 10
const RHO = 28
const BETA = 8 / 3
const DT = 0.0065
const BURN_IN = 800
const MAX_POINTS = 9000

const WING_CENTER_Z = 25 // the figure's vertical middle, in Lorenz units
const FIGURE_WIDTH = 40
const FIGURE_HEIGHT = 50
const NARROW = 768

type Point = readonly [number, number, number]

const flow = ([x, y, z]: Point): Point => [SIGMA * (y - x), x * (RHO - z) - y, x * y - BETA * z]

// Midpoint step: accurate enough at this step size, and all a backdrop needs.
function step(p: Point): Point {
  const k1 = flow(p)
  const k2 = flow([p[0] + (k1[0] * DT) / 2, p[1] + (k1[1] * DT) / 2, p[2] + (k1[2] * DT) / 2])
  return [p[0] + k2[0] * DT, p[1] + k2[1] * DT, p[2] + k2[2] * DT]
}

/** xyz triples, cut where the orbit returns closest to its start so the comet can loop. */
export function buildOrbit(): Float32Array {
  let p: Point = [0.1, 0, 0]
  for (let i = 0; i < BURN_IN; i++) p = step(p)

  const points = new Float32Array(MAX_POINTS * 3)
  for (let i = 0; i < MAX_POINTS; i++) {
    points.set(p, i * 3)
    p = step(p)
  }

  let closest = MAX_POINTS
  let closestGap = Number.POSITIVE_INFINITY
  for (let i = MAX_POINTS / 2; i < MAX_POINTS; i++) {
    const gap = Math.hypot(
      points[i * 3] - points[0],
      points[i * 3 + 1] - points[1],
      points[i * 3 + 2] - points[2],
    )
    if (gap < closestGap) {
      closestGap = gap
      closest = i
    }
  }
  return points.slice(0, closest * 3)
}

/** Writes screen x, screen y and depth per point. Reuses `out`, as this runs every frame. */
export function projectOrbit(
  orbit: Float32Array,
  t: number,
  scale: number,
  centerX: number,
  centerY: number,
  out: Float32Array,
): void {
  const angle = 0.25 + 0.5 * Math.sin(t * 0.21) // oscillates, so the butterfly stays readable
  const tilt = 0.25 * Math.sin(t * 0.13)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  for (let i = 0; i < orbit.length; i += 3) {
    const x = orbit[i]
    const y = orbit[i + 1]
    const depth = -x * sin + y * cos
    out[i] = centerX + (x * cos + y * sin) * scale
    out[i + 1] = centerY - (orbit[i + 2] - WING_CENTER_Z + depth * tilt) * scale
    out[i + 2] = depth
  }
}

/** Pixels per Lorenz unit: fits a text column on wide screens, the width on phones. */
export function viewportScale(width: number, height: number): number {
  if (width <= NARROW) return (width * 0.9) / FIGURE_WIDTH
  return Math.min((height * 0.8) / FIGURE_HEIGHT, (width * 0.45) / FIGURE_WIDTH)
}

/** Where the figure sits. During Experience it clears the illustration stage. */
export function placeFigure(
  width: number,
  height: number,
  inExperience: boolean,
  textLeft: number,
): { x: number; y: number } {
  if (width <= NARROW) return { x: width / 2, y: inExperience ? height * 0.72 : height / 2 }
  if (inExperience) return { x: (width / 2 + textLeft) / 2, y: height / 2 }
  return { x: width * 0.66, y: height * 0.46 }
}
