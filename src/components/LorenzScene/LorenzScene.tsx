// The page's backdrop: a Lorenz attractor on a dot grid. A faint full orbit turns
// slowly while a comet in the accent color traces its two wings.

import { useEffect, useRef } from 'react'
import { useSectionActive } from '@/hooks/useSectionActive'
import { useTheme } from '@/hooks/useTheme'
import { prefersReducedMotion } from '@/lib/gsap'
import { readSceneColors } from '@/lib/theme'
import styles from './LorenzScene.module.css'
import { buildOrbit, placeFigure, projectOrbit, viewportScale } from './lorenzField'

const PITCH = 4 // px between grid dots
const DOT = 2 // px
const FRAME_MS = 1000 / 30
const COMET_RATE = 260 // orbit points per second
const TRAIL = 1300 // about 5s of tail
const FROZEN_T = 40 // the reduced-motion frame
const EASE = 0.08 // per frame, about a second between placements

// One alpha per dot level; a dot keeps the brightest level that lands on it.
const SPARSE_INK = [0.1]
const ORBIT_INK = [0.14, 0.18, 0.24, 0.3]
const TRAIL_LEVELS = 14
const ORBIT_BASE = SPARSE_INK.length + 1
const TRAIL_BASE = ORBIT_BASE + ORBIT_INK.length
const LEVELS = TRAIL_BASE + TRAIL_LEVELS

function readAccent(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
}

export function LorenzScene() {
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
    const { r, g, b } = readSceneColors()
    const accent = readAccent()

    const inks: string[] = ['']
    for (const alpha of [...SPARSE_INK, ...ORBIT_INK]) inks.push(`rgba(${r}, ${g}, ${b}, ${alpha})`)

    const orbit = buildOrbit()
    const pointCount = orbit.length / 3
    const screen = new Float32Array(orbit.length)

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

      projectOrbit(orbit, t, viewportScale(width, height), x, y, screen)
      grid.set(sparse)

      for (let i = 0; i < orbit.length; i += 3) {
        const depthLevel = Math.max(0, Math.min(3, Math.floor((screen[i + 2] + 22) / 11)))
        mark(screen[i], screen[i + 1], ORBIT_BASE + depthLevel)
      }

      const head = Math.floor(t * COMET_RATE) % pointCount
      for (let back = TRAIL; back >= 0; back -= 1) {
        const i = ((head - back + pointCount) % pointCount) * 3
        const level = TRAIL_BASE + Math.floor((1 - back / TRAIL) * (TRAIL_LEVELS - 1))
        mark(screen[i], screen[i + 1], level)
      }

      for (const bucket of buckets) bucket.length = 0
      for (let cell = 0; cell < grid.length; cell++) {
        if (grid[cell]) buckets[grid[cell]].push(cell)
      }

      ctx.clearRect(0, 0, width, height)
      for (let level = 1; level < LEVELS; level++) {
        const trailStep = level - TRAIL_BASE
        ctx.fillStyle = trailStep >= 0 ? accent : inks[level]
        ctx.globalAlpha = trailStep >= 0 ? 0.2 + (0.8 * trailStep) / (TRAIL_LEVELS - 1) : 1
        ctx.beginPath()
        for (const cell of buckets[level]) {
          ctx.rect((cell % cols) * PITCH, Math.floor(cell / cols) * PITCH, DOT, DOT)
        }
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(screen[head * 3], screen[head * 3 + 1], DOT * 2, 0, Math.PI * 2)
      ctx.fill()
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
      data-lorenz-canvas
      data-blur={inExperience}
      aria-hidden="true"
    />
  )
}
