import { type CSSProperties, memo, useEffect, useMemo, useRef, useState } from 'react'
import { playWaterSound } from './alert'
import { butterfly, flock, koi } from './art/decor'
import { petMarkup } from './art/pets'
import { HEIGHT, SPECIES, STAGES } from './art/trees'
import { layout, PET_ORDER, type Plot } from './garden-layout'
import { MATURE, type Tree } from './session'

const WATER_MS = 2600
const MIN_PLOT_PX = 28
const PLOT_UNITS = 64
const MAX_BUTTERFLIES = 14
const WIDEST_SCREEN = 2.4 // width over height

const place = (gx: number, gy: number) => [(gx - gy) * 32, (gx + gy) * 16]
const use = (id: string) => `<use href="#${id}"/>`

function treeLabel({ species, stage }: Tree) {
  const name = `${SPECIES[species].name} ${STAGES[stage].toLowerCase()}`
  return stage < MATURE ? `${name}, from an abandoned session` : name
}

// Everything that stays put between renders, as markup, so the page never rebuilds it.
function drawScene(plots: Plot[], trees: readonly Tree[]) {
  const xs = plots.map((p) => place(p.gx, p.gy))
  const minX = Math.min(...xs.map(([x]) => x)) - 32
  const maxX = Math.max(...xs.map(([x]) => x)) + 32
  const minY = Math.min(...xs.map(([, y]) => y)) - 16
  const maxY = Math.max(...xs.map(([, y]) => y)) + 16

  let top = minY
  let cast = ''
  let ground = ''
  let flutter = ''
  let butterflies = 0
  for (const p of plots) {
    const [x, y] = place(p.gx, p.gy)
    cast += `M${x} ${y + 12}L${x + 32} ${y + 28}L${x} ${y + 44}L${x - 32} ${y + 28}Z`
    ground += `<use href="#${p.ground}" x="${x}" y="${y}"/>`
    if (p.kind === 'tree') top = Math.min(top, y - HEIGHT[p.tree.stage] - 22)
    if (p.kind === 'decoration' && p.decoration === 'meadow') {
      for (let b = 0; b < 3 && butterflies < MAX_BUTTERFLIES; b++) {
        flutter += butterfly(x + (b - 1) * 18, y - 14 - b * 5, butterflies++)
      }
    }
  }

  const margin = 16
  const w = maxX - minX + margin * 2
  const vbY = top - margin
  const h = maxY + 46 - vbY
  // A small garden leaves sky at its sides on a wide screen, so birds must start and end out past it.
  const sideSky = Math.max(0, (WIDEST_SCREEN * h - w) / 2)
  const minPx = (w / PLOT_UNITS) * MIN_PLOT_PX // shortcut: scrolls past 28px per plot; add drag-to-pan if long scrolling feels bad
  return {
    cast,
    ground,
    flying:
      flutter + (trees.length >= 10 ? flock(minX - margin - sideSky, vbY, w + sideSky * 2, h) : ''),
    viewBox: `${minX - margin} ${vbY} ${w} ${h}`,
    style: { minWidth: Math.ceil(minPx), minHeight: Math.ceil((minPx * h) / w) },
  }
}

function plotMarkup(p: Plot) {
  if (p.kind === 'pet') return petMarkup(p.pet, PET_ORDER.indexOf(p.pet))
  if (p.kind !== 'decoration') return ''
  return p.decoration === 'pond' ? koi() + use('egret') : use(p.decoration)
}

type Props = { trees: readonly Tree[]; canWater?: boolean }

export const Garden = memo(function Garden({ trees, canWater = true }: Props) {
  const plots = useMemo(() => layout(trees), [trees])
  const scene = useMemo(() => (trees.length ? drawScene(plots, trees) : null), [plots, trees])
  const [active, setActive] = useState(0)
  const [watering, setWatering] = useState<ReadonlySet<number>>(new Set())
  const [announcement, setAnnouncement] = useState('')
  const svg = useRef<SVGSVGElement>(null)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const t of pending) clearTimeout(t)
    }
  }, [])

  function water(i: number) {
    setActive(i)
    setAnnouncement(`Watered the ${treeLabel(trees[i])}.`)
    if (watering.has(i)) return
    playWaterSound()
    setWatering((now) => new Set(now).add(i))
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      setWatering((now) => {
        const next = new Set(now)
        next.delete(i)
        return next
      })
    }, WATER_MS)
    timers.current.add(timer)
  }

  function onKeyDown(ev: React.KeyboardEvent, i: number) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault()
      water(i)
      return
    }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key]
    if (!step) return
    ev.preventDefault()
    const next = i + step
    if (next < 0 || next >= trees.length) return
    setActive(next)
    svg.current?.querySelector<SVGGElement>(`[data-i="${next}"]`)?.focus()
  }

  if (!scene) {
    return <p className="empty">Your garden is empty. Finish a Work session to plant a tree.</p>
  }

  return (
    <div className="garden">
      <div className="scroller">
        <div className="world" style={scene.style}>
          {/* The shadow is its own layer, so it stays on the ground while the island floats above it. */}
          <svg className="island-shadow" viewBox={scene.viewBox} aria-hidden="true">
            <path d={scene.cast} style={{ fill: 'var(--cast)' }} opacity=".55" />
          </svg>
          {/* biome-ignore lint/a11y/useSemanticElements: an SVG element cannot be a <fieldset> */}
          <svg
            ref={svg}
            className="island"
            viewBox={scene.viewBox}
            role="group"
            aria-label={`Garden with ${trees.length} ${trees.length === 1 ? 'tree' : 'trees'}`}
          >
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: markup is generated by this app, with no outside input */}
            <g dangerouslySetInnerHTML={{ __html: scene.ground }} />
            {plots.map((p) => {
              if (p.kind === 'grass') return null
              const [x, y] = place(p.gx, p.gy)
              const transform = `translate(${x} ${y})`
              if (p.kind !== 'tree') {
                return (
                  <g
                    key={`${p.gx},${p.gy}`}
                    transform={transform}
                    data-pet={p.kind === 'pet' ? p.pet : undefined}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is generated by this app, with no outside input
                    dangerouslySetInnerHTML={{ __html: plotMarkup(p) }}
                  />
                )
              }
              const h = HEIGHT[p.tree.stage]
              const wet = watering.has(p.index)
              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: it has handlers only while its role is button
                <g
                  key={p.index}
                  className={!canWater ? undefined : wet ? 't w' : 't'}
                  role={canWater ? 'button' : 'img'}
                  tabIndex={!canWater ? undefined : p.index === active ? 0 : -1}
                  data-i={p.index}
                  aria-label={canWater ? `Water this ${treeLabel(p.tree)}` : treeLabel(p.tree)}
                  transform={transform}
                  onClick={canWater ? () => water(p.index) : undefined}
                  onKeyDown={canWater ? (ev) => onKeyDown(ev, p.index) : undefined}
                >
                  <path className="hit" d="M0 -16L32 0L0 16L-32 0Z" fill="transparent" />
                  <rect x="-28" y={-h} width="56" height={h} fill="transparent" />
                  {wet && <path className="wet" d="M0 -14L28 0L0 14L-28 0Z" fill="#24401F" />}
                  <g className="art">
                    <use href={`#tree-${p.tree.species}-${p.tree.stage}`} />
                  </g>
                  {wet && (
                    <>
                      <g className="drops">
                        {[-12, -7, -9, -4, -11, -6, -8].map((dx, i) => (
                          <rect
                            key={`${dx}`}
                            x={dx + (i % 3) * 3}
                            y={-h - 6}
                            width="2.4"
                            height="3.6"
                            rx="1"
                            fill="#3F93D6"
                            style={
                              {
                                '--d': `${h + 6}px`,
                                animationDelay: `${450 + i * 110}ms`,
                              } as CSSProperties
                            }
                          />
                        ))}
                      </g>
                      <g transform={`translate(-30 ${-h - 8})`}>
                        <g className="can">
                          <use href="#can" />
                        </g>
                      </g>
                    </>
                  )}
                </g>
              )
            })}
            <g
              style={{ pointerEvents: 'none' }}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is generated by this app, with no outside input
              dangerouslySetInnerHTML={{ __html: scene.flying }}
            />
          </svg>
        </div>
      </div>
      <p className="sr" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
})
