// The light theme's backdrop: a heavy red star and a light black companion swing around
// their shared centre of mass in halftone dots, trailing their paths past a drifting star field.

import { useEffect, useRef } from 'react'
import { STAR_DRIFT, starKind } from '@/components/BlackHoleScene/blackHoleField'
import { useSectionActive } from '@/hooks/useSectionActive'
import { useTheme } from '@/hooks/useTheme'
import { prefersReducedMotion } from '@/lib/gsap'
import { readSceneColors } from '@/lib/theme'
import styles from './BinaryStarScene.module.css'
import {
  buildOrbits,
  discDot,
  HEAVY_RADIUS,
  haloStrength,
  LIGHT_RADIUS,
  ORBIT_SAMPLES,
  PERIOD,
  placeFigure,
  viewportScale,
} from './binaryStarField'

const PITCH = 4 // px between grid dots
const DOT_RADIUS = 1.25 // px
const CELL_COLS = 2 // a braille cell is 2x4 dots and takes one color
const CELL_ROWS = 4
const FRAME_MS = 1000 / 30
const FROZEN_T = 4 // the reduced-motion frame, with the stars well apart
const EASE = 0.08 // per frame, about a second between placements

const LATTICE = PITCH * 2 // px between the discs' and glows' dots, coarser so each dot reads
const TRAIL = Math.floor(ORBIT_SAMPLES * 0.85)
const TRAIL_WIDTH = 6 // px: dots are whole, so this lands about 1.5 dots wide on average
const CROSS_ARM = 5 // px
const CROSS_ALPHA = 0.5

// One alpha per dot level; a cell keeps the brightest level that lands in it.
const SPARSE_ALPHA = 0.12
const STRENGTHS = 16
const PALEST = 0.08
const STRONGEST = 1
const FIRST_LEVEL = 2
const HEAVY_INK = 0
const LIGHT_INK = 1
const INKS = 2 // levels interleave the inks, so comparing levels compares strength
const STAR_LEVEL = FIRST_LEVEL + STRENGTHS * INKS // the star field's three kinds, as the black hole's
const STAR_RADII = [0.64, 0.8] // px
const STAR_ALPHAS = [0.45, 0.9, 0.9]
const STAR_CROSS_LEVEL = STAR_LEVEL + 2
const STAR_CROSS_ARM = 3 // px
const LEVELS = STAR_LEVEL + STAR_ALPHAS.length

const levelOf = (strength: number, ink: number) =>
  FIRST_LEVEL + Math.floor(strength * (STRENGTHS - 1)) * INKS + ink

export function BinaryStarScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const inExperience = useSectionActive('experience')
  const inExperienceRef = useRef(false)

  useEffect(() => {
    inExperienceRef.current = inExperience
  }, [inExperience])

  // `theme` is not read in the body, but toggling it must rebuild the scene so the
  // inks are re-read from the CSS tokens.
  // biome-ignore lint/correctness/useExhaustiveDependencies(theme): forces a rebuild to re-read theme tokens
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // jsdom has no 2D context: render the element, skip the scene

    const reduce = prefersReducedMotion()
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim()
    const { r, g, b } = readSceneColors()
    const ink = `rgb(${r}, ${g}, ${b})`

    const alphas = [0, SPARSE_ALPHA]
    const fills = [accent, accent]
    for (let step = 0; step < STRENGTHS; step++) {
      const alpha = PALEST + ((STRONGEST - PALEST) * step) / (STRENGTHS - 1)
      alphas.push(alpha, alpha)
      fills.push(accent, ink)
    }
    for (const alpha of STAR_ALPHAS) {
      alphas.push(alpha)
      fills.push(ink)
    }

    const { heavy, light, centerOfMass } = buildOrbits()

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let textLeft = 0
    let grid = new Uint8Array(0)
    let sparse = new Uint8Array(0)
    let x: number | null = null
    let y = 0

    const measure = () => {
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / PITCH)
      rows = Math.ceil(height / PITCH)
      grid = new Uint8Array(cols * rows)
      sparse = new Uint8Array(cols * rows)
      for (let row = 0; row < rows; row += 6) {
        for (let col = row % 12 === 0 ? 0 : 3; col < cols; col += 6) sparse[row * cols + col] = 1
      }
      textLeft = document.getElementById('experience-heading')?.getBoundingClientRect().left ?? 0
    }
    measure()
    window.addEventListener('resize', measure)

    const mark = (px: number, py: number, level: number) => {
      const col = Math.round(px / PITCH)
      const row = Math.round(py / PITCH)
      if (col < 0 || row < 0 || col >= cols || row >= rows) return
      const cell = row * cols + col
      if (grid[cell] < level) grid[cell] = level
    }

    const onLattice = (v: number) => Math.floor(v / LATTICE) * LATTICE

    const markHalo = (px: number, py: number, radius: number, starInk: number) => {
      const reach = radius * 4
      for (let dotY = onLattice(py - reach); dotY <= py + reach; dotY += LATTICE) {
        for (let dotX = onLattice(px - reach); dotX <= px + reach; dotX += LATTICE) {
          const distance = Math.hypot(dotX + PITCH / 2 - px, dotY + PITCH / 2 - py)
          const strength = haloStrength(distance / radius)
          if (strength > 0) mark(dotX, dotY, levelOf(strength, starInk))
        }
      }
    }

    // Trails and glows would fill the gaps between a disc's dots.
    const clearDisc = (px: number, py: number, radius: number) => {
      const reach = Math.ceil(radius / PITCH)
      const centerCol = Math.round(px / PITCH)
      const centerRow = Math.round(py / PITCH)
      for (let row = Math.max(0, centerRow - reach); row <= centerRow + reach; row++) {
        if (row >= rows) break
        for (let col = Math.max(0, centerCol - reach); col <= centerCol + reach; col++) {
          if (col >= cols) break
          if (Math.hypot(col - centerCol, row - centerRow) <= reach) grid[row * cols + col] = 0
        }
      }
    }

    const drawDisc = (px: number, py: number, radius: number, fill: string) => {
      ctx.fillStyle = fill
      ctx.beginPath()
      for (let dotY = onLattice(py - radius); dotY <= py + radius; dotY += LATTICE) {
        for (let dotX = onLattice(px - radius); dotX <= px + radius; dotX += LATTICE) {
          const centerX = dotX + PITCH / 2
          const centerY = dotY + PITCH / 2
          const distance = Math.hypot(centerX - px, centerY - py) / radius
          if (distance > 1) continue
          const dotRadius = discDot(distance) * LATTICE
          ctx.moveTo(centerX + dotRadius, centerY)
          ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2)
        }
      }
      ctx.fill()
    }

    const buckets: number[][] = Array.from({ length: LEVELS }, () => [])

    const draw = (t: number) => {
      const target = placeFigure(width, height, inExperienceRef.current, textLeft)
      if (x === null || reduce) {
        x = target.x
        y = target.y
      } else {
        x += (target.x - x) * EASE
        y += (target.y - y) * EASE
      }

      const scale = viewportScale(width, height)
      const head = Math.floor((t / PERIOD) * ORBIT_SAMPLES) % ORBIT_SAMPLES
      const heavyX = x + heavy[head * 2] * scale
      const heavyY = y + heavy[head * 2 + 1] * scale
      const lightX = x + light[head * 2] * scale
      const lightY = y + light[head * 2 + 1] * scale
      const heavyRadius = HEAVY_RADIUS * scale
      const lightRadius = LIGHT_RADIUS * scale

      grid.fill(0)
      markHalo(heavyX, heavyY, heavyRadius, HEAVY_INK)
      markHalo(lightX, lightY, lightRadius, LIGHT_INK)

      const offset = (TRAIL_WIDTH - PITCH) / 2
      for (let back = TRAIL; back >= 0; back -= 1) {
        const i = ((head - back + ORBIT_SAMPLES) % ORBIT_SAMPLES) * 2
        const strength = 1 - back / TRAIL
        for (const dx of [-offset, offset]) {
          for (const dy of [-offset, offset]) {
            const heavyLevel = levelOf(strength, HEAVY_INK)
            mark(x + heavy[i] * scale + dx, y + heavy[i + 1] * scale + dy, heavyLevel)
            const lightLevel = levelOf(strength, LIGHT_INK)
            mark(x + light[i] * scale + dx, y + light[i + 1] * scale + dy, lightLevel)
          }
        }
      }

      for (let row = 0; row < rows; row += CELL_ROWS) {
        for (let col = 0; col < cols; col += CELL_COLS) {
          let brightest = 0
          for (let r = row; r < Math.min(row + CELL_ROWS, rows); r++) {
            for (let c = col; c < Math.min(col + CELL_COLS, cols); c++) {
              brightest = Math.max(brightest, grid[r * cols + c])
            }
          }
          for (let r = row; r < Math.min(row + CELL_ROWS, rows); r++) {
            for (let c = col; c < Math.min(col + CELL_COLS, cols); c++) {
              const cell = r * cols + c
              if (grid[cell]) grid[cell] = brightest
              else if (!brightest) grid[cell] = sparse[cell]
            }
          }
        }
      }

      const drift = t * STAR_DRIFT
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = row * cols + col
          if (grid[cell] > 1) continue
          const kind = starKind(col + drift, row)
          if (kind) grid[cell] = STAR_LEVEL + kind - 1
        }
      }
      clearDisc(heavyX, heavyY, heavyRadius)
      clearDisc(lightX, lightY, lightRadius)

      for (const bucket of buckets) bucket.length = 0
      for (let cell = 0; cell < grid.length; cell++) {
        if (grid[cell]) buckets[grid[cell]].push(cell)
      }

      ctx.clearRect(0, 0, width, height)
      for (let level = 1; level < LEVELS; level++) {
        ctx.fillStyle = fills[level]
        ctx.globalAlpha = alphas[level]
        ctx.beginPath()
        const radius = STAR_RADII[level - STAR_LEVEL] ?? DOT_RADIUS
        for (const cell of buckets[level]) {
          const px = (cell % cols) * PITCH + PITCH / 2
          const py = Math.floor(cell / cols) * PITCH + PITCH / 2
          if (level === STAR_CROSS_LEVEL) {
            ctx.rect(px - STAR_CROSS_ARM, py - 0.5, STAR_CROSS_ARM * 2, 1)
            ctx.rect(px - 0.5, py - STAR_CROSS_ARM, 1, STAR_CROSS_ARM * 2)
            continue
          }
          ctx.moveTo(px + radius, py)
          ctx.arc(px, py, radius, 0, Math.PI * 2)
        }
        ctx.fill()
      }

      const crossX = x + centerOfMass[0] * scale
      const crossY = y + centerOfMass[1] * scale
      ctx.fillStyle = ink
      ctx.globalAlpha = CROSS_ALPHA
      ctx.fillRect(crossX - CROSS_ARM, crossY - 0.5, CROSS_ARM * 2, 1)
      ctx.fillRect(crossX - 0.5, crossY - CROSS_ARM, 1, CROSS_ARM * 2)

      ctx.globalAlpha = 1
      drawDisc(heavyX, heavyY, heavyRadius, accent)
      drawDisc(lightX, lightY, lightRadius, ink)
    }

    let frame = 0
    let lastDraw = 0
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (now - lastDraw < FRAME_MS) return
      lastDraw = now
      canvas.dataset.dim = String(window.scrollY > height / 2)
      draw(reduce ? FROZEN_T : now / 1000)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [theme])

  // The canvas is pure decoration and never focusable (pointer-events: none), so
  // hiding it from AT is safe; biome's focusable-element heuristic can't know that.
  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas, not focusable
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      data-binary-star-canvas
      data-blur={inExperience}
      aria-hidden="true"
    />
  )
}
