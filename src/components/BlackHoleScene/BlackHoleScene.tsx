// The page's backdrop: a black hole in halftone dots. A faint star field bends around
// an empty shadow while an accretion disk in the accent color swirls past it.

import { useEffect, useRef } from 'react'
import { useSectionActive } from '@/hooks/useSectionActive'
import { useTheme } from '@/hooks/useTheme'
import { prefersReducedMotion } from '@/lib/gsap'
import { readSceneColors } from '@/lib/theme'
import styles from './BlackHoleScene.module.css'
import {
  buildField,
  DISK_INK,
  diskDot,
  dotPitch,
  type Field,
  INK_COUNT,
  placeFigure,
  RING_INK,
  STAR_INK,
  shadeField,
  viewportScale,
} from './blackHoleField'

const FRAME_MS = 1000 / 24
const FROZEN_T = 2 // the reduced-motion frame
const EASE = 0.08 // per frame, about a second between placements

// In pitches. The field stays barely there, so the disk and stars carry the contrast.
const FIELD_DOT = 0.15
const FIELD_ALPHA = 0.14
const STAR_DOTS = [0.16, 0.2]
const STAR_ALPHAS = [0.45, 0.9, 0.9]
const CROSS_ARM = 0.75
const CROSS_STROKE = 1 // px
const RING_PINK = 0.5 // how far the ring's pink dots mix from the accent toward the ink

export function BlackHoleScene() {
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

    const fills: string[] = []
    const alphas: number[] = []
    const radii: number[] = []
    for (let level = 0; level < INK_COUNT; level++) {
      if (level >= DISK_INK) {
        const inRing = level >= RING_INK
        const { radius, heat } = diskDot(level - (inRing ? RING_INK : DISK_INK))
        const mix = inRing ? heat * RING_PINK : heat
        fills.push(mix > 0 ? `color-mix(in srgb, ${ink} ${mix * 100}%, ${accent})` : accent)
        alphas.push(1)
        radii.push(radius)
      } else if (level >= STAR_INK) {
        fills.push(ink)
        alphas.push(STAR_ALPHAS[level - STAR_INK])
        radii.push(STAR_DOTS[level - STAR_INK] ?? 0)
      } else {
        fills.push(ink)
        alphas.push(FIELD_ALPHA)
        radii.push(FIELD_DOT * Math.sqrt(level / (STAR_INK - 1)))
      }
    }
    const buckets: number[][] = Array.from({ length: INK_COUNT }, () => [])

    let width = 0
    let height = 0
    let pitch = dotPitch(0)
    let field: Field = buildField(0, 0, 1)
    let textLeft = 0
    let x: number | null = null
    let y = 0

    const measure = () => {
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      pitch = dotPitch(width)
      const cols = Math.ceil(width / pitch)
      const rows = Math.ceil(height / pitch)
      field = buildField(cols, rows, viewportScale(width, height) / pitch)
      textLeft = document.getElementById('experience-heading')?.getBoundingClientRect().left ?? 0
    }
    measure()
    window.addEventListener('resize', measure)

    const draw = (t: number) => {
      const target = placeFigure(width, height, inExperienceRef.current, textLeft)
      if (x === null || reduce) {
        x = target.x
        y = target.y
      } else {
        x += (target.x - x) * EASE
        y += (target.y - y) * EASE
      }

      shadeField(field, t, x / pitch, y / pitch)

      for (const bucket of buckets) bucket.length = 0
      for (let i = 0; i < field.inks.length; i++) {
        if (field.inks[i]) buckets[field.inks[i]].push(i)
      }

      ctx.clearRect(0, 0, width, height)
      for (let level = 1; level < INK_COUNT; level++) {
        const radius = radii[level] * pitch
        ctx.fillStyle = fills[level]
        ctx.globalAlpha = alphas[level]
        ctx.beginPath()
        for (const i of buckets[level]) {
          const px = (i % field.cols) * pitch + pitch / 2
          const py = Math.floor(i / field.cols) * pitch + pitch / 2
          if (level === STAR_INK + 2) {
            const arm = CROSS_ARM * pitch
            ctx.rect(px - arm, py - CROSS_STROKE / 2, arm * 2, CROSS_STROKE)
            ctx.rect(px - CROSS_STROKE / 2, py - arm, CROSS_STROKE, arm * 2)
            continue
          }
          ctx.moveTo(px + radius, py)
          ctx.arc(px, py, radius, 0, Math.PI * 2)
        }
        ctx.fill()
      }
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
      data-black-hole-canvas
      data-blur={inExperience}
      aria-hidden="true"
    />
  )
}
