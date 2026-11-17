import {
  type CSSProperties,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { playWaterSound } from './alert'
import { butterfly, flock, koi, landingBee, petals } from './art/decor'
import {
  dragonfly,
  FEATURE_IDS,
  type FeatureId,
  feature,
  fireflies,
  towerHeight,
} from './art/features'
import { PET_FRAME, type PetId, petMarkup } from './art/pets'
import { HEIGHT, SPECIES, STAGES } from './art/trees'
import {
  arrivedPets,
  beeSpots,
  layout,
  PET_ORDER,
  type PetSpots,
  type Plot,
  settlePets,
  towerFloors,
} from './garden-layout'
import { MATURE, type Tree } from './session'

const WATER_MS = 2600
export const STEP_MS = 2400 // Longer than the 2s hop in styles.css, so one pet lands before the next sets off.
const MIN_PLOT_PX = 28
const PLOT_UNITS = 64
const MAX_BUTTERFLIES = 14
const MAX_DRAGONFLIES = 6
const MAX_LIVELY_TREES = 24 // Each one repaints the island, so a huge garden must not sway every tree.
const BREEZE_PHASES = 4 // Trees sharing a phase repaint in the same frame.
const WIDEST_SCREEN = 2.4 // width over height
const MAX_ZOOM = 4
const ZOOM_STEP = 1.25
const DRAG_PX = 4

// view is how many quarter turns the island has made.
const place = ({ gx, gy }: Plot, view: number) => {
  const [a, b] = [
    [gx, gy],
    [-gy, gx],
    [-gx, -gy],
    [gy, -gx],
  ][view]
  return [(a - b) * 32, (a + b) * 16]
}
const use = (id: string) => `<use href="#${id}"/>`
const depthOf = (p: Plot, view: number) => place(p, view)[1] / 16

function treeLabel({ species, stage }: Tree) {
  const name = `${SPECIES[species].name} ${STAGES[stage].toLowerCase()}`
  return stage < MATURE ? `${name}, from an abandoned session` : name
}

// Everything that stays put between renders, as markup, so the page never rebuilds it.
function drawScene(plots: Plot[], trees: readonly Tree[], view: number) {
  const xs = plots.map((p) => place(p, view))
  const minX = Math.min(...xs.map(([x]) => x)) - 32
  const maxX = Math.max(...xs.map(([x]) => x)) + 32
  const minY = Math.min(...xs.map(([, y]) => y)) - 16
  const maxY = Math.max(...xs.map(([, y]) => y)) + 16

  let top = minY + 16 + PET_FRAME.y // Room for an animal standing on the back row.
  let cast = ''
  let flutter = ''
  let butterflies = 0
  let dragonflies = 0
  for (const p of plots) {
    const [x, y] = place(p, view)
    cast += `M${x} ${y + 12}L${x + 32} ${y + 28}L${x} ${y + 44}L${x - 32} ${y + 28}Z`
    // The highest this tree stands from any side, so the frame holds still as the garden turns.
    const backmost = -(Math.abs(p.gx) + Math.abs(p.gy)) * 16
    if (p.kind === 'tree') top = Math.min(top, backmost - HEIGHT[p.tree.stage] - 22)
    if (p.kind !== 'decoration') continue
    if (p.decoration === 'tower')
      top = Math.min(top, backmost - towerHeight(towerFloors(trees.length)))
    if (p.decoration === 'meadow') flutter += fireflies(x, y, p.gx * 31 + p.gy)
    if (p.decoration === 'reeds' && dragonflies < MAX_DRAGONFLIES)
      flutter += dragonfly(x - 14, y - 22, dragonflies++) + dragonfly(x + 12, y - 14, dragonflies++)
    if (p.decoration === 'meadow' || p.decoration === 'flowers') {
      for (let b = 0; b < 3 && butterflies < MAX_BUTTERFLIES; b++) {
        flutter += butterfly(x + (b - 1) * 18, y - 14 - b * 5, butterflies++)
      }
    }
  }

  const ground = [...plots]
    .sort((a, b) => depthOf(a, view) - depthOf(b, view))
    .map((p) => {
      const [x, y] = place(p, view)
      return `<use href="#${p.ground}" x="${x}" y="${y}"/>`
    })
    .join('')

  const visiting = new Map<number, string>()
  beeSpots(plots, trees.length).forEach((plot, i) => {
    const [x, y] = place(plot, view)
    const depth = depthOf(plot, view)
    visiting.set(depth, (visiting.get(depth) ?? '') + landingBee(x, y, i))
  })

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
    visiting,
    flying:
      flutter + (trees.length >= 10 ? flock(minX - margin - sideSky, vbY, w + sideSky * 2, h) : ''),
    viewBox: `${minX - margin} ${vbY} ${w} ${h}`,
    style: { minWidth: Math.ceil(minPx), minHeight: Math.ceil((minPx * h) / w) },
  }
}

type Roam = {
  plots: Plot[]
  at: PetSpots
  turned: Partial<Record<PetId, boolean>>
  walking?: { pet: PetId; from: Plot }
}

const isFeature = (id: string): id is FeatureId => (FEATURE_IDS as readonly string[]).includes(id)
const decorationMarkup = ({ decoration }: Plot & { kind: 'decoration' }, treeCount: number) =>
  decoration === 'pond'
    ? koi() + use('egret')
    : isFeature(decoration)
      ? feature(decoration, towerFloors(treeCount))
      : use(decoration)

type MarkupProps = { html: string; transform?: string; style?: CSSProperties }
const NO_POINTER: CSSProperties = { pointerEvents: 'none' }

// Memoized because React 19 rewrites innerHTML on every render of it, which restarts each animation inside.
const Markup = memo(function Markup({ html, ...rest }: MarkupProps) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is generated by this app, with no outside input
  return <g {...rest} dangerouslySetInnerHTML={{ __html: html }} />
})

type Props = { trees: readonly Tree[]; canWater?: boolean }

export const Garden = memo(function Garden({ trees, canWater = true }: Props) {
  const plots = useMemo(() => layout(trees), [trees])
  const [view, setView] = useState(0)
  const scene = useMemo(
    () => (trees.length ? drawScene(plots, trees, view) : null),
    [plots, trees, view],
  )
  const [active, setActive] = useState(0)
  const [watering, setWatering] = useState<ReadonlySet<number>>(new Set())
  const [announcement, setAnnouncement] = useState('')
  const rows = useMemo(() => {
    const byDepth = new Map<number, Plot[]>()
    for (const p of plots) {
      const depth = depthOf(p, view)
      byDepth.set(depth, [...(byDepth.get(depth) ?? []), p])
    }
    return [...byDepth].sort(([a], [b]) => a - b)
  }, [plots, view])
  const [roam, setRoam] = useState<Roam>(() => ({
    plots,
    at: settlePets(plots, trees.length),
    turned: {},
  }))
  if (roam.plots !== plots) {
    setRoam({ plots, at: settlePets(plots, trees.length, roam.at), turned: roam.turned })
  }
  const svg = useRef<SVGSVGElement>(null)
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const shownZoom = useRef(1)
  const anchor = useRef<[number, number] | null>(null) // The point in the scroller that holds still while zooming.
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(
    null,
  )
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const t of pending) clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const pets = arrivedPets(trees.length)
    if (!pets.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const open = plots.filter((p) => p.kind === 'grass')
    const timer = setInterval(() => {
      // The two extra slots are turns where nobody moves, so a lone pet still rests.
      const pet = pets[Math.floor(Math.random() * (pets.length + 2))]
      const pick = Math.random()
      if (!pet) return
      setRoam((was) => {
        const here = was.at[pet]
        if (was.plots !== plots || !here) return was
        const taken = Object.values(was.at)
        const free = open.filter(
          (s) =>
            Math.max(Math.abs(s.gx - here.gx), Math.abs(s.gy - here.gy)) === 1 &&
            !taken.includes(s),
        )
        if (!free.length) return was
        const next = free[Math.floor(pick * free.length)]
        // Pets are drawn facing left, so one heading right is mirrored, and stays that way when it sits.
        const right = place(next, view)[0] - place(here, view)[0]
        return {
          plots,
          at: { ...was.at, [pet]: next },
          turned: right ? { ...was.turned, [pet]: right > 0 } : was.turned,
          walking: { pet, from: here },
        }
      })
    }, STEP_MS)
    return () => clearInterval(timer)
  }, [plots, trees.length, view])

  function zoomBy(factor: number, at: [number, number] | null = null) {
    anchor.current = at
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, z * factor)))
  }

  useLayoutEffect(() => {
    const el = scroller
    const ratio = zoom / shownZoom.current
    shownZoom.current = zoom
    if (!el || ratio === 1) return
    const [cx, cy] = anchor.current ?? [el.clientWidth / 2, el.clientHeight / 2]
    el.scrollLeft = (el.scrollLeft + cx) * ratio - cx
    el.scrollTop = (el.scrollTop + cy) * ratio - cy
  }, [zoom, scroller])

  useEffect(() => {
    const el = scroller
    if (!el) return
    // React's onWheel is passive, so it could not stop the page from scrolling.
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault()
      const dy = ev.deltaY * (ev.deltaMode === 1 ? 33 : 1)
      const box = el.getBoundingClientRect()
      anchor.current = [ev.clientX - box.left, ev.clientY - box.top]
      // A trackpad pinch arrives as a ctrl+wheel with small deltas.
      const factor = Math.exp(-dy * (ev.ctrlKey ? 0.01 : 0.002))
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, z * factor)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scroller])

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

  // On a step a pet is drawn at the nearer of its two plots, so it never walks under what it's in front of.
  const petsAt = (depth: number) =>
    (Object.entries(roam.at) as [PetId, Plot][]).filter(([id, spot]) => {
      const from = roam.walking?.pet === id ? roam.walking.from : spot
      return Math.max(depthOf(spot, view), depthOf(from, view)) === depth
    })

  if (!scene) {
    return <p className="empty">Your garden is empty. Finish a Work session to plant a tree.</p>
  }

  return (
    <div className="garden">
      <div
        ref={setScroller}
        className="scroller"
        onPointerDown={(ev) => {
          const el = scroller
          if (ev.pointerType === 'touch' || ev.button !== 0 || !el) return
          drag.current = {
            x: ev.clientX,
            y: ev.clientY,
            left: el.scrollLeft,
            top: el.scrollTop,
            moved: false,
          }
        }}
        onPointerMove={(ev) => {
          const d = drag.current
          const el = scroller
          if (!d || !el) return
          if (!(ev.buttons & 1)) {
            drag.current = null
            return
          }
          const dx = ev.clientX - d.x
          const dy = ev.clientY - d.y
          if (Math.hypot(dx, dy) > DRAG_PX) d.moved = true
          if (!d.moved) return
          el.scrollLeft = d.left - dx
          el.scrollTop = d.top - dy
        }}
        onClickCapture={(ev) => {
          if (drag.current?.moved) ev.stopPropagation()
          drag.current = null
        }}
      >
        <div
          className="world"
          style={{
            width: `${zoom * 100}%`,
            height: `${zoom * 100}%`,
            minWidth: scene.style.minWidth * zoom,
            minHeight: scene.style.minHeight * zoom,
          }}
        >
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
            <Markup html={scene.ground} />
            {/* One group per depth, so a pet changing depth never moves a tree in the page. */}
            {rows.map(([depth, row]) => (
              <g key={depth} data-depth={depth}>
                {row.map((p) => {
                  if (p.kind === 'grass') return null
                  const [x, y] = place(p, view)
                  const transform = `translate(${x} ${y})`
                  if (p.kind !== 'tree') {
                    return (
                      <Markup
                        key={`${p.gx},${p.gy}`}
                        transform={transform}
                        html={decorationMarkup(p, trees.length)}
                      />
                    )
                  }
                  const h = HEIGHT[p.tree.stage]
                  const wet = watering.has(p.index)
                  const lively = p.index < MAX_LIVELY_TREES
                  const { fallen } = SPECIES[p.tree.species]
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
                        <g
                          className={lively && p.tree.stage > 0 ? 'life breeze' : undefined}
                          style={{ animationDelay: `${-(p.index % BREEZE_PHASES) * 0.8}s` }}
                        >
                          <use href={`#tree-${p.tree.species}-${p.tree.stage}`} />
                        </g>
                      </g>
                      {lively && fallen && p.tree.stage === MATURE && (
                        <Markup html={petals(fallen, h, p.index)} />
                      )}
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
                {scene.visiting.has(depth) && (
                  <Markup style={NO_POINTER} html={scene.visiting.get(depth) as string} />
                )}
                {petsAt(depth).map(([id, spot]) => {
                  const [x, y] = place(spot, view)
                  const from = roam.walking?.pet === id ? roam.walking.from : null
                  const [fx, fy] = from ? place(from, view) : [x, y]
                  return (
                    <g
                      key={id}
                      className={from ? 'life step' : undefined}
                      data-pet={id}
                      style={
                        {
                          pointerEvents: 'none',
                          transform: `translate(${x}px, ${y}px)`,
                          '--fx': `${fx}px`,
                          '--fy': `${fy}px`,
                        } as CSSProperties
                      }
                    >
                      <g
                        className={from ? 'hop' : undefined}
                        onAnimationEnd={() => setRoam((was) => ({ ...was, walking: undefined }))}
                      >
                        <Markup
                          transform={roam.turned[id] ? 'scale(-1 1)' : undefined}
                          html={petMarkup(id, PET_ORDER.indexOf(id))}
                        />
                      </g>
                    </g>
                  )
                })}
              </g>
            ))}
            <Markup style={NO_POINTER} html={scene.flying} />
          </svg>
        </div>
      </div>
      <p className="tree-count">
        {trees.length} {trees.length === 1 ? 'tree' : 'trees'}
      </p>
      <div className="garden-tools">
        <button type="button" onClick={() => setView((v) => (v + 1) % 4)}>
          Rotate garden
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= 1}
          onClick={() => zoomBy(1 / ZOOM_STEP)}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => zoomBy(ZOOM_STEP)}
        >
          +
        </button>
      </div>
      <p className="sr" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
})
