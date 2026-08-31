// The descent scene — the page's living backdrop.
//
// One full-viewport canvas sits fixed behind the content (see
// DescentScene.module.css). The whole document is a single gradient-descent
// run over the loss landscape in ./descentField.ts: the visitor's scroll
// position moves the camera along the precomputed trajectory — high on the
// slope at the top of the page, settled into the global minimum at the end.
// The ground is a wireframe slice of the loss surface that scans downward
// with the camera; field dashes flow along −∇f; the traversed path is drawn
// behind the camera in the poster accent, the remainder dotted ahead, ending
// on the minimum's crosshair.

import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { prefersReducedMotion } from '@/lib/gsap'
import { readSceneColors } from '@/lib/theme'
import styles from './DescentScene.module.css'
import {
  buildTrajectory,
  type CameraPose,
  gradLoss,
  type Projected,
  pointAt,
  poseAt,
  projectionScale,
  projectPoint,
  scrollProgress,
  sliceFlowDirection,
  surfacePoint,
  type Vec3,
} from './descentField'

// ─── Inks ─────────────────────────────────────────────────────────────────────
// Two inks, the grammar every specimen has used: quiet ink for the ground and
// the field, full specimen weight for the one thing that matters — here the
// traversed path and the minimum it converges on, in the poster accent.

const SURFACE_INK = 0.22 // wireframe ground — quiet enough to sit under text rows
const FIELD_INK = 0.3 // field dashes — the weight the flow-field streamlines used
const PATH_AHEAD_INK = 0.3 // the dotted remainder of the run
const ACCENT_INK = 0.75 // traversed path + minimum crosshair — the specimen weight

// ─── The figure ───────────────────────────────────────────────────────────────

const GRID_WINDOW = 7.5 // world units of loss surface drawn around the path
const GRID_LINES = 15 // wireframe resolution, both directions
const SEED_GRID = 5 // 5×5 field-dash streamlines
const SEED_WINDOW = 4.4 // world units of field seeded around the path
const DASH_STEP = 0.16 // integration step along the field (world units)
const DASH_POINTS = 24 // points per dash streamline
const ARROW_SIZE = 0.18 // chevron at each streamline tip, in world units — arrows shrink with depth
const DASH_TRAVEL = 40 // px of dash travel per unit of gradient magnitude × second
const FAR_DEPTH = 14 // world units at which lines have fully faded
const REDUCED_S = 0.5 // the canonical frozen pose — mid-descent

/** The poster accent, parsed from --color-accent so dark mode flips with it. */
function readAccentColor(): { r: number; g: number; b: number } {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
  const hex = raw.replace('#', '')
  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) return { r, g, b }
  }
  return { r: 227, g: 6, b: 19 } // the paper accent — jsdom and unparsable values
}

export function DescentScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  // `theme` is not read in the body — the ink is re-read from the CSS tokens —
  // but it is an intentional dependency: toggling the theme must tear down and
  // rebuild the scene so the figure picks up the new ink.
  // biome-ignore lint/correctness/useExhaustiveDependencies(theme): forces a rebuild to re-read theme tokens
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // jsdom (unit tests) has no 2D context — render the element, skip the scene

    // Reduced-motion visitors get the same figure, frozen: the camera parks at
    // the canonical mid-descent pose and the dashes never travel.
    const reduce = prefersReducedMotion()

    const scene = readSceneColors()
    const ink = (alpha: number) => `rgba(${scene.r}, ${scene.g}, ${scene.b}, ${alpha})`
    const accentColor = readAccentColor()
    const accent = (alpha: number) =>
      `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${alpha})`

    const trajectory = buildTrajectory()
    // The run is fixed, so its drawn geometry is too — map it once per build.
    const rendered = trajectory.points.map(surfacePoint)
    const dashPhase = new Float64Array(SEED_GRID * SEED_GRID)

    // ─── Sizing ──────────────────────────────────────────────────────────────
    let width = 0
    let height = 0
    let maxScroll = 1

    const measure = () => {
      // CSS pixels for layout math, a DPR-capped backing store for crisp
      // hairlines (setTransform scales all later drawing into device px).
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    }
    measure()
    window.addEventListener('resize', measure)

    // ─── Drawing helpers ─────────────────────────────────────────────────────

    // Depth is the only shading: ink thins with camera-space distance.
    const depthFade = (depth: number) => Math.min(1, Math.max(0.12, 1 - depth / FAR_DEPTH))

    // Project a world-space polyline; entries the camera can't see become null.
    const traceProjected = (
      points: Vec3[],
      pose: CameraPose,
    ): { screen: Array<Projected | null>; meanDepth: number } => {
      const screen: Array<Projected | null> = []
      let depthSum = 0
      let visible = 0
      for (const p of points) {
        const q = projectPoint(p, pose, { width, height })
        screen.push(q)
        if (q) {
          depthSum += q.depth
          visible += 1
        }
      }
      return { screen, meanDepth: visible > 0 ? depthSum / visible : FAR_DEPTH }
    }

    // Stroke projected points as one polyline, breaking the subpath wherever
    // the projection was culled (behind the camera).
    const strokeScreen = (
      screen: Array<Projected | null>,
      style: string,
      lineWidth: number,
      dash: number[],
      dashOffset: number,
    ) => {
      ctx.strokeStyle = style
      ctx.lineWidth = lineWidth
      ctx.setLineDash(dash)
      ctx.lineDashOffset = dashOffset
      ctx.beginPath()
      let penDown = false
      for (const q of screen) {
        if (!q) {
          penDown = false
          continue
        }
        if (penDown) ctx.lineTo(q.x, q.y)
        else {
          ctx.moveTo(q.x, q.y)
          penDown = true
        }
      }
      ctx.stroke()
    }

    // A solid chevron at a streamline's downstream tip — the quiver grammar.
    // Direction is stated, not just implied by dash travel. The chevron is
    // sized by the true perspective scale (focal/depth — immune to the
    // foreshortening that flattens tips pointing away from the camera) and
    // clamped, so arrows shrink as the field recedes without ever vanishing.
    const drawArrowhead = (screen: Array<Projected | null>, style: string) => {
      const tip = screen[screen.length - 1]
      if (!tip) return
      let base = screen.length - 2
      while (base >= 0 && !screen[base]) base -= 1 // back to the last visible point
      const prev = base >= 0 ? screen[base] : null
      if (!prev) return
      let ux = tip.x - prev.x
      let uy = tip.y - prev.y
      const dirLen = Math.hypot(ux, uy)
      if (dirLen < 1e-6) return
      ux /= dirLen
      uy /= dirLen
      const size = Math.min(
        Math.max(ARROW_SIZE * projectionScale(tip.depth, { width, height }), 3),
        24,
      )
      const backX = -ux * size
      const backY = -uy * size
      const half = size * 0.42 // barb splay
      ctx.strokeStyle = style
      ctx.lineWidth = 1
      ctx.setLineDash([])
      ctx.lineDashOffset = 0
      ctx.beginPath()
      ctx.moveTo(tip.x + backX - uy * half, tip.y + backY + ux * half)
      ctx.lineTo(tip.x, tip.y)
      ctx.lineTo(tip.x + backX + uy * half, tip.y + backY - ux * half)
      ctx.stroke()
    }

    // ─── The frame loop ──────────────────────────────────────────────────────
    // The rAF stays the single source of motion, no ScrollTrigger here.
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      // Seconds since the last frame, clamped so a background-tab pause can't
      // make the scene catch up in a jolt when the tab returns.
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // The reduced-motion gate: everything time- or scroll-driven lives
      // behind this branch. Frozen step + parked s = the canonical still.
      let step = 0
      let s = REDUCED_S
      if (!reduce) {
        step = dt
        s = scrollProgress(window.scrollY, maxScroll)
      }

      const pose = poseAt(trajectory, s)
      // The wireframe and the dashes sample the loss at the optimizer's
      // current y — the slice plane scans downward as the run descends.
      const sliceY = pointAt(trajectory, s).y
      const center = pointAt(trajectory, Math.min(1, s + 0.05))

      ctx.clearRect(0, 0, width, height)

      // ── 1. The ground: wireframe slice of the loss surface ─────────────────
      const half = GRID_WINDOW / 2
      const gridStep = GRID_WINDOW / (GRID_LINES - 1)
      for (let i = 0; i < GRID_LINES; i++) {
        const offset = -half + i * gridStep
        const alongX: Vec3[] = []
        const alongZ: Vec3[] = []
        for (let j = 0; j < GRID_LINES; j++) {
          const u = -half + j * gridStep
          alongX.push(surfacePoint({ x: center.x + u, y: sliceY, z: center.z + offset }))
          alongZ.push(surfacePoint({ x: center.x + offset, y: sliceY, z: center.z + u }))
        }
        for (const line of [alongX, alongZ]) {
          const { screen, meanDepth } = traceProjected(line, pose)
          strokeScreen(screen, ink(SURFACE_INK * depthFade(meanDepth)), 1, [], 0)
        }
      }

      // ── 2. The field: dashes flowing down −∇f on the slice ─────────────────
      // Each seed traces a short streamline; its dash phase advances with the
      // local gradient magnitude, so steep ground races and the basin crawls.
      const seedHalf = SEED_WINDOW / 2
      const seedStep = SEED_WINDOW / (SEED_GRID - 1)
      let k = 0
      for (let i = 0; i < SEED_GRID; i++) {
        for (let j = 0; j < SEED_GRID; j++) {
          let px = center.x - seedHalf + i * seedStep
          let pz = center.z - seedHalf + j * seedStep
          const g0 = gradLoss({ x: px, y: sliceY, z: pz })
          const speed = Math.hypot(g0.x, g0.y, g0.z)
          const line: Vec3[] = [surfacePoint({ x: px, y: sliceY, z: pz })]
          for (let n = 1; n < DASH_POINTS; n++) {
            const d = sliceFlowDirection({ x: px, y: sliceY, z: pz })
            px += d.dx * DASH_STEP
            pz += d.dz * DASH_STEP
            line.push(surfacePoint({ x: px, y: sliceY, z: pz }))
          }
          dashPhase[k] += speed * step * DASH_TRAVEL
          const { screen, meanDepth } = traceProjected(line, pose)
          const style = ink(FIELD_INK * depthFade(meanDepth))
          strokeScreen(screen, style, 1, [3, 7], -dashPhase[k])
          drawArrowhead(screen, style)
          k += 1
        }
      }

      // ── 3. The run: dotted remainder ahead, accent path behind ─────────────
      // Where the camera is on the arc decides which part is "behind".
      const target = s * trajectory.totalLength
      let head = 0
      while (head < rendered.length - 1 && trajectory.arcLengths[head + 1] <= target) head += 1

      const ahead = traceProjected(rendered.slice(head), pose)
      strokeScreen(ahead.screen, ink(PATH_AHEAD_INK), 1, [2, 6], 0)

      const behind = traceProjected(rendered.slice(0, head + 1), pose)
      strokeScreen(behind.screen, accent(ACCENT_INK), 1.5, [], 0)

      // ── 4. The minimum: an accent crosshair the whole page descends toward ─
      const mark = projectPoint(rendered[rendered.length - 1], pose, { width, height })
      if (mark) {
        ctx.setLineDash([])
        ctx.strokeStyle = accent(ACCENT_INK)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(mark.x, mark.y, 7, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        for (const [ax, ay] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          ctx.moveTo(mark.x + ax * 9, mark.y + ay * 9)
          ctx.lineTo(mark.x + ax * 12, mark.y + ay * 12)
        }
        ctx.stroke()
      }
    }
    frame = requestAnimationFrame(tick)

    // Teardown on unmount or theme change: stop the loop, drop the listener.
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [theme])

  // The canvas is pure decoration — never focusable (no tabindex, pointer-events:
  // none), so hiding it from AT is safe; biome's focusable-element heuristic can't know that.
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas, not focusable
  return <canvas ref={canvasRef} className={styles.canvas} data-descent-canvas aria-hidden="true" />
}
