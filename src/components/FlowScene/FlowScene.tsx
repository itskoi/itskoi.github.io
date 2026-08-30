import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { prefersReducedMotion } from '@/lib/gsap'
import { readSceneColors } from '@/lib/theme'
import styles from './FlowScene.module.css'
import {
  type FlowField,
  flowTimeline,
  integrateStreamline,
  type ScrollMarkers,
  streetVortices,
} from './flowField'

const LINE_INK = 0.3
const RING_INK = 0.75
const FILL_INK = 0.05
const SEED_ROWS = 14
const FREE_STREAM_RATIO = 0.085
const RADIUS_RATIO = 0.105
const RADIUS_RATIO_MOBILE = 0.15 // the specimen must still read on a narrow viewport
const STATION_X = 0.62
const STATION_Y = 0.48
const SPACING_RATIO = 2.4
const ROW_OFFSET_RATIO = 1.2
const DRIFT_RATIO = 0.8
const CORE_RATIO = 0.35
const STREET_COUNT = 9
const WOBBLE_WAVELENGTH_RATIO = 0.16
const WOBBLE_PERIOD = 9

export function FlowScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  // `theme` is not read in the body — the ink is re-read from the CSS token via
  // readSceneColors() — but it is an intentional dependency: toggling the theme must
  // tear down and rebuild the scene so the streamlines pick up the new ink.
  // biome-ignore lint/correctness/useExhaustiveDependencies(theme): forces a rebuild to re-read theme tokens
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = prefersReducedMotion()
    const scene = readSceneColors()
    const ink = (alpha: number) => `rgba(${scene.r}, ${scene.g}, ${scene.b}, ${alpha})`

    let width = 0
    let height = 0
    let markers: ScrollMarkers = {
      experienceTop: 0,
      educationTop: 0,
      publicationsTop: 0,
      viewportHeight: 0,
    }
    const dashPhase = new Float64Array(SEED_ROWS)

    const measure = () => {
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const vh = window.innerHeight
      const max = Math.max(document.documentElement.scrollHeight - vh, 1)
      const topOf = (id: string) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
      }
      markers = {
        experienceTop: topOf('experience') || max * 0.2,
        educationTop: topOf('education') || max * 0.5,
        publicationsTop: topOf('publications') || max * 0.8,
        viewportHeight: vh,
      }
    }
    measure()
    window.addEventListener('resize', measure)

    let time = 0
    let last = performance.now()
    let frame = 0

    // the rAF stays the single source of motion, no ScrollTrigger here
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      let scrollY = 0
      let step = 0
      if (!reduce) {
        time += dt
        step = dt
        scrollY = window.scrollY
      }

      const tl = flowTimeline(scrollY, markers)
      const U = width * FREE_STREAM_RATIO
      const radiusRatio = width < 768 ? RADIUS_RATIO_MOBILE : RADIUS_RATIO
      const radius = Math.min(width, height) * radiusRatio * (1 - tl.exit)
      const cylinder =
        radius >= 1 ? { cx: width * STATION_X, cy: height * STATION_Y, radius } : null
      const field: FlowField = {
        U,
        cylinder,
        vortices: cylinder
          ? streetVortices({
              time,
              strength: tl.street,
              cylinder,
              U,
              count: STREET_COUNT,
              spacing: radius * SPACING_RATIO,
              rowOffset: radius * ROW_OFFSET_RATIO,
              drift: U * DRIFT_RATIO,
              viewportWidth: width,
            })
          : [],
        vortexCore: radius * CORE_RATIO,
        wobble: 1 - tl.settle,
        wobbleWavelength: width * WOBBLE_WAVELENGTH_RATIO,
        wobbleOmega: (2 * Math.PI) / WOBBLE_PERIOD,
      }

      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1
      ctx.strokeStyle = ink(LINE_INK)
      ctx.setLineDash([4, 6])

      for (let i = 0; i < SEED_ROWS; i += 1) {
        const seedY = ((i + 0.5) / SEED_ROWS) * height
        const { points, meanSpeed } = integrateStreamline(field, 0, seedY, time, { width, height })
        dashPhase[i] += meanSpeed * step
        ctx.lineDashOffset = -dashPhase[i]
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let j = 1; j < points.length; j += 1) {
          ctx.lineTo(points[j].x, points[j].y)
        }
        ctx.stroke()
      }

      if (cylinder) {
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.arc(cylinder.cx, cylinder.cy, cylinder.radius, 0, Math.PI * 2)
        ctx.fillStyle = ink(FILL_INK)
        ctx.fill()
        ctx.strokeStyle = ink(RING_INK)
        ctx.stroke()
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [theme])

  // The canvas is pure decoration — never focusable (no tabindex, pointer-events:
  // none), so hiding it from AT is safe; biome's focusable-element heuristic can't know that.
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas, not focusable
  return <canvas ref={canvasRef} className={styles.canvas} data-flow-canvas aria-hidden="true" />
}
