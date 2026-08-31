// The flow scene — the page's living backdrop.
//
// One full-viewport canvas sits fixed behind the content (see FlowScene.module.css).
// Every animation frame it: reads the scroll position, builds a mathematical
// "velocity field" for that moment, traces streamlines through that field, and
// paints them as traveling dashed hairlines around a planet with an orbiting moon.
// The physics itself lives in ./flowField.ts (pure functions, fully unit-tested);
// this file owns the canvas, the frame loop, and the drawing.

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

// ─── Inks ─────────────────────────────────────────────────────────────────────
// All drawing is monochrome ink read from the CSS token --scene-figure-rgb, so the
// scene inverts with dark mode like the rest of the poster. Two weights, the same
// grammar the chess specimen used: quiet third-ink lines, full specimen ink for
// the rings.

const LINE_INK = 0.3 // streamlines — light enough to cross behind text rows without becoming noise
const RING_INK = 0.75 // the planet + moon rings — the specimen weight
const FILL_INK = 0.05 // the faint disc fill inside each ring

// ─── Layout of the field ──────────────────────────────────────────────────────

const SEED_ROWS = 14 // one streamline is traced from each of 14 points spaced down the left edge
const FREE_STREAM_RATIO = 0.085 // wind speed U = 8.5% of the viewport width per second → a dash crosses the page in ~12 s
const RADIUS_RATIO = 0.105 // planet radius = 10.5% of the shorter viewport side
const RADIUS_RATIO_MOBILE = 0.15 // the specimen must still read on a narrow viewport
const STATION_X = 0.62 // planet center sits at 62% of the width — right of the hero type, left of the edge
const STATION_Y = 0.48 // and just above the vertical midpoint

// ─── The moon ─────────────────────────────────────────────────────────────────
// The moon rides a circular orbit (path not drawn) and is a real obstacle in the
// field: flow parts around it as it passes through.

const MOON_RATIO = 0.28 // moon radius = 28% of the planet's
// the moon deflects flow well beyond its drawn ring — its sphere of influence
const MOON_INFLUENCE = 1.5
const ORBIT_RATIO = 1.9 // orbit radius = 1.9 planet radii (never overlaps the planet)
const ORBIT_PERIOD = 36 // one full orbit every 36 s
const ORBIT_PHASE = -0.9 // starting angle in radians (upper-right; also the frozen reduced-motion pose)

// ─── The vortex street ────────────────────────────────────────────────────────
// In the Education band, alternating vortices peel off behind the planet and march
// downstream; streamlines weave through them. All sizes scale with the planet.

const SPACING_RATIO = 2.4 // distance between consecutive vortices = 2.4 planet radii
const ROW_OFFSET_RATIO = 1.2 // the two staggered rows sit 1.2 planet radii apart
const DRIFT_RATIO = 0.8 // vortices drift downstream at 80% of the wind speed
const CORE_RATIO = 0.35 // vortices are "regularized" inside this core radius (keeps the math finite)
const STREET_COUNT = 9 // how many vortices exist at once

// ─── The ambient wave ─────────────────────────────────────────────────────────
// A gentle traveling waviness in the wind. Always on and driven only by the
// scene clock — scrolling never changes it.

const WOBBLE_WAVELENGTH_RATIO = 0.16 // wave crest spacing = 16% of the width
const WOBBLE_PERIOD = 9 // the wave travels one wavelength every 9 s

export function FlowScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  // `theme` is not read in the body — the ink is re-read from the CSS token via
  // readSceneColors() — but it is an intentional dependency: toggling the theme must
  // tear down and rebuild the scene so the streamlines pick up the new ink.
  // biome-ignore lint/correctness/useExhaustiveDependencies(theme): forces a rebuild to re-read theme tokens
  useEffect(() => {
    // React runs this once per mount (and per theme change). Everything below —
    // the canvas context, the measurement, the frame loop — is created here and
    // torn down in the returned cleanup, so React StrictMode's double-mount in
    // dev never leaves two loops running.
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // jsdom (unit tests) has no 2D context — render the element, skip the scene

    // Reduced-motion users get the same drawing, frozen: `time` and `scrollY` never
    // advance, so the scene paints one canonical still (planet, moon at its phase,
    // laminar lines) every frame instead of animating.
    const reduce = prefersReducedMotion()

    // Read the ink once per build from the live CSS token (ink on paper / paper on ink).
    const scene = readSceneColors()
    const ink = (alpha: number) => `rgba(${scene.r}, ${scene.g}, ${scene.b}, ${alpha})`

    // ─── Sizing and scroll landmarks ───────────────────────────────────────────
    // The scene needs two things from the outside world: how big the viewport is,
    // and where each content section begins in the document. Those become the
    // "bands" the choreography is anchored to. They only change on resize.

    let width = 0
    let height = 0
    let markers: ScrollMarkers = {
      experienceTop: 0,
      educationTop: 0,
      publicationsTop: 0,
      viewportHeight: 0,
    }
    // One dash-phase per streamline — the accumulator that makes dashes travel.
    const dashPhase = new Float64Array(SEED_ROWS)

    const measure = () => {
      // CSS pixels for layout math…
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      // …and a device-pixel-ratio backing store for crisp hairlines (capped at 2×
      // so retina screens don't pay for invisible sharpness). setTransform scales
      // all later drawing from CSS px into device px.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Where each section starts, in document coordinates. getBoundingClientRect
      // is viewport-relative, so adding the current scroll converts to "absolute"
      // position — comparable with window.scrollY at any moment. If an id is
      // missing (jsdom), fall back to fractions of the page so nothing explodes.
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

    // ─── The frame loop ────────────────────────────────────────────────────────
    let time = 0 // scene clock in seconds — drives orbits, waves, dash travel
    let last = performance.now() // previous frame's timestamp, for dt
    let frame = 0 // the pending rAF handle, for cleanup

    // the rAF stays the single source of motion, no ScrollTrigger here
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      // Seconds since the last frame, clamped to 50 ms so a background-tab pause
      // can't make the scene "catch up" in a jolt when the tab returns.
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // The reduced-motion gate: everything time- or scroll-driven lives behind
      // this branch. Frozen time + zero scroll = the static laminar frame.
      let scrollY = 0
      let step = 0
      if (!reduce) {
        time += dt
        step = dt
        scrollY = window.scrollY
      }

      // ─── 1. Where are we in the story? ──────────────────────────────────────
      // The scroll position inside the section bands becomes three 0..1 progress
      // values: shed + street (the vortex street develops and holds, Experience
      // → Publications) and exit (the street and planet decay toward the end).
      // The ambient wave is not here by design — it ignores scroll entirely.
      const tl = flowTimeline(scrollY, markers)

      // ─── 2. The bodies ──────────────────────────────────────────────────────
      // Planet radius shrinks with `exit`, so it dematerializes by the end of the
      // page (a 1px radius means gone). Mobile uses a larger ratio so the specimen
      // still reads on a phone.
      const U = width * FREE_STREAM_RATIO
      const radiusRatio = width < 768 ? RADIUS_RATIO_MOBILE : RADIUS_RATIO
      const radius = Math.min(width, height) * radiusRatio * (1 - tl.exit)
      const planet = radius >= 1 ? { cx: width * STATION_X, cy: height * STATION_Y, radius } : null
      // The moon's position is a pure function of the scene clock — no state, so
      // it always restarts deterministically and freezes cleanly under reduce.
      const moonAngle = (time * 2 * Math.PI) / ORBIT_PERIOD + ORBIT_PHASE
      const moon = (() => {
        if (!planet) return null
        const orbit = planet.radius * ORBIT_RATIO
        return {
          cx: planet.cx + orbit * Math.cos(moonAngle),
          cy: planet.cy + orbit * Math.sin(moonAngle),
          radius: planet.radius * MOON_RATIO,
        }
      })()

      // ─── 3. The field ───────────────────────────────────────────────────────
      // Everything the flow "knows" in this frame, assembled as one value:
      //   - bodies: the planet and the moon (inflated to its sphere of influence)
      //     — both deflect the streamlines as real obstacles
      //   - vortices: the street, spawned behind the planet as a pure function of
      //     (time, strength) — strength 0 outside the Education-ish bands
      //   - wobble: the ambient wave, always at full weight — scroll-independent
      const field: FlowField = {
        U,
        bodies: planet && moon ? [planet, { ...moon, radius: moon.radius * MOON_INFLUENCE }] : [],
        vortices: planet
          ? streetVortices({
              time,
              strength: tl.street,
              cylinder: planet,
              U,
              count: STREET_COUNT,
              spacing: radius * SPACING_RATIO,
              rowOffset: radius * ROW_OFFSET_RATIO,
              drift: U * DRIFT_RATIO,
              viewportWidth: width,
            })
          : [],
        vortexCore: radius * CORE_RATIO,
        wobble: 1,
        wobbleWavelength: width * WOBBLE_WAVELENGTH_RATIO,
        wobbleOmega: (2 * Math.PI) / WOBBLE_PERIOD,
      }

      // ─── 4. Paint the streamlines ───────────────────────────────────────────
      // Full clear, then one dashed hairline stroke per seed. setLineDash makes
      // each stroke a dotted dash pattern; moving lineDashOffset slides the
      // pattern along the line, which is what makes the flow read as *moving*.
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1
      ctx.strokeStyle = ink(LINE_INK)
      ctx.setLineDash([4, 6])

      for (let i = 0; i < SEED_ROWS; i += 1) {
        // Seed points sit at (0, (i + 0.5)/14 · height) — evenly spaced rows,
        // offset by half a row so no seed aims exactly at the planet's
        // stagnation point (where flow slows to zero and a line would stall).
        const seedY = ((i + 0.5) / SEED_ROWS) * height
        // Walk the field from the seed to the far edge: ~6 px steps, bending
        // wherever the field points, projected off any body it meets. meanSpeed
        // is the average field speed along the line.
        const { points, meanSpeed } = integrateStreamline(field, 0, seedY, time, { width, height })
        // Dash travel: advance this line's dash phase by the distance a fluid
        // parcel would cover this frame (speed × dt). Near the stagnation poles
        // dashes crawl; over the crown they race — the acceleration is visible.
        dashPhase[i] += meanSpeed * step
        ctx.lineDashOffset = -dashPhase[i]
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let j = 1; j < points.length; j += 1) {
          ctx.lineTo(points[j].x, points[j].y)
        }
        ctx.stroke()
      }

      // ─── 5. Paint the bodies ────────────────────────────────────────────────
      // Solid strokes (no dashes) so the rings read as objects, not flow. Drawn
      // after the lines so the rings sit on top of anything that grazes them.
      if (planet && moon) {
        ctx.setLineDash([])

        // the moon — same ring/fill grammar as the planet, on an invisible orbit
        ctx.beginPath()
        ctx.arc(moon.cx, moon.cy, moon.radius, 0, Math.PI * 2)
        ctx.fillStyle = ink(FILL_INK)
        ctx.fill()
        ctx.strokeStyle = ink(RING_INK)
        ctx.stroke()

        // the planet — fill + specimen ring, nothing more
        ctx.beginPath()
        ctx.arc(planet.cx, planet.cy, planet.radius, 0, Math.PI * 2)
        ctx.fillStyle = ink(FILL_INK)
        ctx.fill()
        ctx.strokeStyle = ink(RING_INK)
        ctx.stroke()
      }
    }
    frame = requestAnimationFrame(tick)

    // Teardown on unmount or theme change: stop the loop, drop the listener.
    // The next effect run rebuilds everything with fresh ink.
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
