// The black hole's maths, per halftone dot. Pure, so it can be tested without a canvas.
// Ported from ascii-magic-art's pieces/black-hole.js and lib/kit.js, MIT: see
// LICENSE.ascii-magic-art next to this file.

const FIELD_LEVELS = 8
const STAR_LEVELS = 3
const DISK_LEVELS = 18
export const FIELD_INK = 1 // ink 0 means nothing is painted
export const STAR_INK = FIELD_INK + FIELD_LEVELS
export const DISK_INK = STAR_INK + STAR_LEVELS
export const RING_INK = DISK_INK + DISK_LEVELS // the same levels, drawn pink
export const INK_COUNT = RING_INK + DISK_LEVELS

// In the piece's units.
const SHADOW = 10.5 // the source's is 9.5; the owner asked for a slightly larger ring
const DISK_TILT = 0.2
const DISK_INNER = 13
const DISK_OUTER = 46
const ROLL = -0.08
const COS_ROLL = Math.cos(ROLL)
const SIN_ROLL = Math.sin(ROLL)
const LOOP_S = 7
// Narrower and dimmer than the source's: one ink has no color gradient to keep them apart.
const RING_WIDTH = 0.45
const RING_MIN_DOTS = 0.6 // any thinner and a coarse grid breaks the ring into dashes
const RING_PINK_FROM_LEVEL = 9 // dimmer dots are pure accent, with no white to tint
const RING_PINK_TEXTURE = 0.5
const HALO_CENTER = 1.1 // in shadow radii
const HALO_WIDTH = 0.2 // in shadow radii
const HALO_GAIN = 0.5
export const STAR_DRIFT = 3 // dots per second
const FULL_DOT = 0.52 // pitches: the source's largest dot, just short of touching
const HOT_FROM = 0.55
const FIELD_FLOOR = 0.3 // the field's shadows lose their dots, as a halftone's do
const FIELD_RANGE = 0.35

// Larger and sparser than the source's map, because dots are finer than its text cells.
const STAR_COLS = 256
const STAR_ROWS = 256
const STAR_COUNT = 200
const STAR_ORIGIN_COL = 50
const STAR_ORIGIN_ROW = 50

const FIGURE_WIDTH = 92 // the disk's outer diameter
const MIN_PITCH = 4 // px
const MAX_COLS = 240
const NARROW = 768

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (v: number) => v * v * (3 - 2 * v)
const wrap = (v: number, size: number) => ((v % size) + size) % size

function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function noise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = smooth(x - xi)
  const yf = smooth(y - yi)
  const top = hash(xi, yi, seed) * (1 - xf) + hash(xi + 1, yi, seed) * xf
  const bottom = hash(xi, yi + 1, seed) * (1 - xf) + hash(xi + 1, yi + 1, seed) * xf
  return top * (1 - yf) + bottom * yf
}

function fbm(x: number, y: number, octaves: number, seed: number): number {
  let sum = 0
  let amplitude = 0.5
  let frequency = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amplitude * noise(x * frequency, y * frequency, seed + i * 17)
    norm += amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  return sum / norm
}

function random(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let m = a
    m = Math.imul(m ^ (m >>> 15), m | 1)
    m ^= m + Math.imul(m ^ (m >>> 7), m | 61)
    return ((m ^ (m >>> 14)) >>> 0) / 4294967296
  }
}

const STARS = (() => {
  const next = random(3)
  const stars = new Uint8Array(STAR_COLS * STAR_ROWS)
  for (let i = 0; i < STAR_COUNT; i++) {
    const cell = Math.floor(next() * STAR_COLS) + Math.floor(next() * STAR_ROWS) * STAR_COLS
    stars[cell] = 1 + Math.floor(next() * 3)
  }
  return stars
})()

/** Which star a position on the endless star map holds: 0 for none, else its kind, 1 to 3. */
export function starKind(col: number, row: number): number {
  return STARS[Math.floor(wrap(row, STAR_ROWS)) * STAR_COLS + Math.floor(wrap(col, STAR_COLS))]
}

// Two crossfaded layers in co-rotating coordinates, so the winding never runs away.
function diskTexture(radius: number, phase: number, t: number): number {
  let sum = 0
  for (let layer = 0; layer < 2; layer++) {
    const f = (t / LOOP_S + layer * 0.5) % 1
    const weight = 1 - Math.abs(f * 2 - 1)
    const angle = phase - f * LOOP_S * 1.7 * (DISK_INNER / radius) ** 1.5
    const x = Math.cos(angle) * radius * 0.22 + layer * 30
    sum += weight * fbm(x, Math.sin(angle) * radius * 0.22, 3, 2)
  }
  return sum
}

export interface Field {
  cols: number
  rows: number
  scale: number
  backdrop: Float32Array // the field's noise, fixed per viewport
  inks: Uint8Array // per dot, 0 for no dot
}

export function buildField(cols: number, rows: number, scale: number): Field {
  const backdrop = new Float32Array(cols * rows)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      backdrop[row * cols + col] = fbm((col / scale) * 0.03, (row / scale) * 0.04, 4, 8)
    }
  }
  return {
    cols,
    rows,
    scale,
    backdrop,
    inks: new Uint8Array(cols * rows),
  }
}

/** Writes an ink per dot. Reuses the field's arrays, as this runs every frame. */
export function shadeField(field: Field, t: number, holeCol: number, holeRow: number): void {
  const { cols, rows, scale, backdrop, inks } = field
  const ringWidth = Math.max(RING_WIDTH, RING_MIN_DOTS / scale)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = row * cols + col
      const dx = (col + 0.5 - holeCol) / scale
      const dy = (row + 0.5 - holeRow) / scale
      const u = dx * COS_ROLL + dy * SIN_ROLL
      const w = -dx * SIN_ROLL + dy * COS_ROLL
      const radius = Math.hypot(u, w)
      let intensity = -1

      inks[cell] = 0

      if (radius > SHADOW) {
        // Stars are sampled per dot, not per unit, so they stay single dots at any scale.
        const bend = 1 + (SHADOW * SHADOW * 1.4) / (radius * radius)
        const halo = Math.exp(-(radius - SHADOW) / 20) * 0.35
        const v = clamp((backdrop[cell] * 0.9 - 0.18 + halo - FIELD_FLOOR) / FIELD_RANGE)
        const star = starKind(
          STAR_ORIGIN_COL + dx * scale * bend + t * STAR_DRIFT,
          STAR_ORIGIN_ROW + dy * scale * bend,
        )
        if (star) inks[cell] = STAR_INK + star - 1
        else if (v > 0)
          inks[cell] = FIELD_INK + Math.min(FIELD_LEVELS - 1, Math.floor(v * FIELD_LEVELS))
      }

      // The far disk, lensed into a halo hugging the shadow.
      if (radius > SHADOW && radius < SHADOW * 2) {
        const angle = Math.atan2(w, u)
        const top = 0.55 + 0.45 * Math.max(0, -Math.sin(angle))
        const profile = Math.exp(-(((radius - SHADOW * HALO_CENTER) / (SHADOW * HALO_WIDTH)) ** 2))
        const texture = diskTexture(DISK_INNER + (radius - SHADOW) * 3, angle, t)
        intensity =
          HALO_GAIN * profile * top * (0.55 + 0.75 * texture) * (1 - 0.35 * Math.cos(angle))
      }

      const ring = Math.exp(-(((radius - SHADOW * 1.04) / ringWidth) ** 2))
      const ringGlow = ring > 0.2 ? ring * 1.05 : 0
      intensity = Math.max(intensity, ringGlow)

      // The near disk, passing in front of the shadow's lower half.
      const depth = w / DISK_TILT
      const diskRadius = Math.hypot(u, depth)
      if (
        diskRadius > DISK_INNER &&
        diskRadius < DISK_OUTER &&
        (depth > 0 || radius > SHADOW * 1.05)
      ) {
        const temperature = (DISK_INNER / diskRadius) ** 0.9
        const edge = clamp((diskRadius - DISK_INNER) / 2) * clamp((DISK_OUTER - diskRadius) / 10)
        const doppler = 1 - 0.5 * (u / diskRadius)
        const texture = diskTexture(diskRadius, Math.atan2(depth, u), t)
        const disk = temperature * edge * doppler * (0.45 + 0.9 * texture)
        const dimmed = depth < 0 && radius < SHADOW * 2.1
        intensity = Math.max(intensity, dimmed ? disk * 0.6 : disk)
      }

      if (intensity > 0.06) {
        const level = Math.min(DISK_LEVELS - 1, Math.floor(clamp(intensity) * DISK_LEVELS))
        const pink =
          intensity === ringGlow &&
          level >= RING_PINK_FROM_LEVEL &&
          diskTexture(DISK_INNER, Math.atan2(w, u), t) > RING_PINK_TEXTURE
        inks[cell] = (pink ? RING_INK : DISK_INK) + level
      }
    }
  }
}

/**
 * A disk dot's look, as the source's halftone reads it. There a dot's area is its glyph's
 * ink times its color's luminance, which across the source's gradient comes to about
 * smoothstep(v)^1.5: specks when dim, full dots when hot. `heat` stands in for the
 * gradient's white end, as a 0..1 mix toward the scene ink.
 */
export function diskDot(level: number): { radius: number; heat: number } {
  const v = (level + 1) / DISK_LEVELS
  const area = smooth(v) ** 1.5
  return {
    radius: FULL_DOT * Math.sqrt(area),
    heat: smooth(clamp((v - HOT_FROM) / (1 - HOT_FROM))),
  }
}

/** The dots' spacing in px. It grows on huge screens to bound the frame cost. */
export function dotPitch(width: number): number {
  return Math.max(MIN_PITCH, width / MAX_COLS)
}

/** Pixels per piece unit: the disk spans half a wide screen, nearly all of a phone's. */
export function viewportScale(width: number, height: number): number {
  if (width <= NARROW) return (width * 0.95) / FIGURE_WIDTH
  return Math.min(width * 0.5, height * 0.9) / FIGURE_WIDTH
}

/** Where the hole sits. During Experience it clears the illustration stage. */
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
