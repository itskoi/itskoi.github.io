import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'
import { onThemeChange, readSceneColors } from '@/lib/theme'
import styles from './Background.module.css'

const STAR_COUNT = 200
const NODE_COUNT = 34
// Normalized (0..1) distance under which two nodes get linked by a wire.
const LINK_DIST = 0.17
// How many electric pulses travel the wires at once.
const PULSE_COUNT = 8
// Scroll-driven breathing zoom of the whole sky (one zoom in → out over the page).
const ZOOM_BASE = 1.11
const ZOOM_AMP = 0.4
const ZOOM_CYCLES = 1

interface Star {
  x: number
  y: number
  r: number
  a: number
  bright: boolean
}

interface Node {
  x: number
  y: number
}

interface Pulse {
  link: number
  t: number
  speed: number
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // jsdom / no 2D context → CSS gradient still shows.

    const reduce = prefersReducedMotion()

    // Figure color comes from the active theme (white in dark mode, ink in light).
    // `fig` reads `scene` by reference so a theme change re-tints everything live.
    let scene = readSceneColors()
    const fig = (alpha: number) => `rgba(${scene.r}, ${scene.g}, ${scene.b}, ${alpha})`

    // Positions are normalized so they stay stable across resizes.
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
      const bright = Math.random() < 0.08
      return {
        x: Math.random(),
        y: Math.random(),
        r: bright ? Math.random() * 1.4 + 1.1 : Math.random() * 0.9 + 0.3,
        a: bright ? Math.random() * 0.4 + 0.6 : Math.random() * 0.5 + 0.2,
        bright,
      }
    })
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
    }))
    const links: [number, number][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < LINK_DIST) {
          links.push([i, j])
        }
      }
    }

    const pulses: Pulse[] = Array.from({ length: PULSE_COUNT }, () => ({
      link: links.length ? Math.floor(Math.random() * links.length) : 0,
      t: Math.random(),
      speed: 0.25 + Math.random() * 0.6,
    }))

    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    let viewW = 1
    let viewH = 1

    // Render the static layer (stars + wires + nodes) to the offscreen buffer.
    const renderStatic = (target: CanvasRenderingContext2D, w: number, h: number) => {
      target.clearRect(0, 0, w, h)
      for (const s of stars) {
        target.globalAlpha = s.a
        target.fillStyle = s.bright ? fig(1) : fig(0.7)
        if (s.bright) {
          target.beginPath()
          target.arc(s.x * w, s.y * h, s.r * 2.4, 0, Math.PI * 2)
          target.fillStyle = fig(0.18)
          target.fill()
          target.fillStyle = fig(1)
        }
        target.beginPath()
        target.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        target.fill()
      }
      target.globalAlpha = 1
      target.strokeStyle = fig(0.13)
      target.lineWidth = 1
      target.beginPath()
      for (const [i, j] of links) {
        target.moveTo(nodes[i].x * w, nodes[i].y * h)
        target.lineTo(nodes[j].x * w, nodes[j].y * h)
      }
      target.stroke()
      target.fillStyle = fig(0.5)
      for (const n of nodes) {
        target.beginPath()
        target.arc(n.x * w, n.y * h, 1.4, 0, Math.PI * 2)
        target.fill()
      }
    }

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      viewW = canvas.clientWidth || 1
      viewH = canvas.clientHeight || 1
      canvas.width = Math.floor(viewW * dpr)
      canvas.height = Math.floor(viewH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      offscreen.width = canvas.width
      offscreen.height = canvas.height
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      renderStatic(offCtx, viewW, viewH)
    }

    const blitStatic = () => {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(offscreen, 0, 0)
      ctx.restore()
    }

    const drawPulse = (p: Pulse, w: number, h: number) => {
      if (!links.length) return
      const [ai, bi] = links[p.link % links.length]
      const ax = nodes[ai].x * w
      const ay = nodes[ai].y * h
      const bx = nodes[bi].x * w
      const by = nodes[bi].y * h
      const px = ax + (bx - ax) * p.t
      const py = ay + (by - ay) * p.t
      const flick = 0.6 + Math.random() * 0.4

      ctx.fillStyle = fig(0.25 * flick)
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = fig(0.95 * flick)
      ctx.beginPath()
      ctx.arc(px, py, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }

    setup()

    let raf = 0
    let last = performance.now()
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // Zoom the sky only while scrolling (progress is static when not scrolling).
      const max = maxScroll()
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      if (backdropRef.current) {
        const amp = ZOOM_AMP * Math.sin(progress * Math.PI * ZOOM_CYCLES)
        const scale = ZOOM_BASE + (amp > 0 ? amp : 0)
        backdropRef.current.style.transform = `scale(${scale})`
      }

      blitStatic()
      ctx.globalCompositeOperation = 'lighter'
      for (const p of pulses) {
        p.t += p.speed * dt
        if (p.t > 1) {
          p.link = Math.floor(Math.random() * links.length)
          p.t = 0
          p.speed = 0.25 + Math.random() * 0.6
        }
        drawPulse(p, viewW, viewH)
      }
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(loop)
    }

    if (reduce) {
      blitStatic()
    } else {
      raf = requestAnimationFrame(loop)
    }

    const onResize = () => {
      setup()
      if (reduce) blitStatic()
    }
    window.addEventListener('resize', onResize)

    // Re-tint the static layer when the theme flips (pulse loop reads `scene` live).
    const unsubscribe = onThemeChange(() => {
      scene = readSceneColors()
      renderStatic(offCtx, viewW, viewH)
      if (reduce) blitStatic()
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      unsubscribe()
    }
  }, [])

  return (
    <div className={styles.backdrop} ref={backdropRef}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
