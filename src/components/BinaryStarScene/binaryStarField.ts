// Two stars on Kepler ellipses around their shared centre of mass. Pure, so it can be
// tested without a canvas. Ported from ascii-magic-art's binary-stars piece, MIT: see
// LICENSE.ascii-magic-art next to this file.

export const PERIOD = 9 // seconds per orbit
export const ORBIT_SAMPLES = 1800
export const HEAVY_SHARE = 0.32 // each star's share of the separation, opposite its mass share
export const LIGHT_SHARE = 0.68
export const HEAVY_RADIUS = 0.105 // figure units
export const LIGHT_RADIUS = 0.065

const ECCENTRICITY = 0.55
const KEPLER_STEPS = 8
const TILT = 0.35 // radians
const SQUASH = 0.62 // the orbit plane, seen at an angle
const FIGURE_WIDTH = 1.6 // figure units, a little over the orbits' bounding box
const FIGURE_HEIGHT = 0.9
const NARROW = 768

export interface Orbits {
  heavy: Float32Array // x, y per sample, evenly spaced in time
  light: Float32Array
  centerOfMass: readonly [number, number]
}

/** Solves Kepler's equation, so the separation shrinks and the pace rises near closest approach. */
function separationAt(phase: number): readonly [number, number] {
  const meanAnomaly = phase * Math.PI * 2
  let eccentric = meanAnomaly
  for (let i = 0; i < KEPLER_STEPS; i++) {
    eccentric -=
      (eccentric - ECCENTRICITY * Math.sin(eccentric) - meanAnomaly) /
      (1 - ECCENTRICITY * Math.cos(eccentric))
  }
  return [
    Math.cos(eccentric) - ECCENTRICITY,
    Math.sqrt(1 - ECCENTRICITY * ECCENTRICITY) * Math.sin(eccentric),
  ]
}

/** One period of both stars, in figure units with the bounding box centered on the origin. */
export function buildOrbits(): Orbits {
  const heavy = new Float32Array(ORBIT_SAMPLES * 2)
  const light = new Float32Array(ORBIT_SAMPLES * 2)
  const cos = Math.cos(TILT)
  const sin = Math.sin(TILT)

  for (let i = 0; i < ORBIT_SAMPLES; i++) {
    const [dx, dy] = separationAt(i / ORBIT_SAMPLES)
    const across = dx * cos - dy * sin
    const down = (dx * sin + dy * cos) * SQUASH
    heavy.set([-HEAVY_SHARE * across, -HEAVY_SHARE * down], i * 2)
    light.set([LIGHT_SHARE * across, LIGHT_SHARE * down], i * 2)
  }

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const orbit of [heavy, light]) {
    for (let i = 0; i < orbit.length; i += 2) {
      minX = Math.min(minX, orbit[i])
      maxX = Math.max(maxX, orbit[i])
      minY = Math.min(minY, orbit[i + 1])
      maxY = Math.max(maxY, orbit[i + 1])
    }
  }
  const midX = (minX + maxX) / 2
  const midY = (minY + maxY) / 2
  for (const orbit of [heavy, light]) {
    for (let i = 0; i < orbit.length; i += 2) {
      orbit[i] -= midX
      orbit[i + 1] -= midY
    }
  }
  return { heavy, light, centerOfMass: [-midX, -midY] }
}

/** How strong a star's glow is outside its disc: 0.5 at the surface, cut off at 4 radii. */
export function haloStrength(distanceInRadii: number): number {
  if (distanceInRadii < 1 || distanceInRadii > 4) return 0
  return 0.5 / distanceInRadii
}

/** A disc dot's radius, in lattice steps: large at the centre, specks at the rim, never touching. */
export function discDot(distanceInRadii: number): number {
  return 0.16 + 0.28 * Math.sqrt(1 - distanceInRadii * distanceInRadii)
}

/** Pixels per figure unit: fits a text column on wide screens, the width on phones. */
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
