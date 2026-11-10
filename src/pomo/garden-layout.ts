import { rnd } from './art/cubes'
import { PLOT_KINDS } from './art/decor'
import type { PetId } from './art/pets'
import type { Tree } from './session'

export type Decoration = 'pond' | 'rocks' | 'meadow' | 'flowers' | 'reeds' | 'boulder'
type Spot = { gx: number; gy: number; ground: string }
export type Plot = Spot &
  (
    | { kind: 'tree'; tree: Tree; index: number }
    | { kind: 'decoration'; decoration: Decoration }
    | { kind: 'grass' }
  )

// How many trees it takes for each pet to arrive, in the order they arrive.
export const PET_ARRIVAL: Record<PetId, number> = {
  corgi: 3,
  white: 5,
  shiba: 8,
  yellow: 11,
  black: 14,
  golden: 17,
  buffalo: 17,
  bear: 21,
  monkey: 26,
  elephant: 32,
}
export const PET_ORDER = Object.keys(PET_ARRIVAL) as PetId[]

const OPEN_SHARE = 0.48 // Of the plots trees could take, how many stay grass.

// Spiral position, what stands there, and how many trees it takes to arrive. Trees never take these plots.
const FEATURES: Record<number, [Decoration, number]> = {
  6: ['meadow', 7],
  16: ['pond', 16],
  18: ['flowers', 17],
  20: ['rocks', 18],
  33: ['meadow', 30],
  35: ['rocks', 31],
  37: ['reeds', 32],
  39: ['boulder', 33],
  41: ['pond', 34],
  43: ['flowers', 35],
  59: ['flowers', 50],
  61: ['meadow', 51],
  63: ['pond', 52],
  65: ['reeds', 53],
  68: ['boulder', 55],
  70: ['rocks', 56],
  72: ['pond', 57],
  93: ['reeds', 77],
  95: ['meadow', 78],
  98: ['rocks', 80],
  100: ['flowers', 81],
  103: ['boulder', 83],
  106: ['pond', 85],
  109: ['flowers', 87],
}
const GROUND: Record<Decoration, string> = {
  pond: 'pond-ground',
  rocks: 'plot-1',
  meadow: 'plot-2',
  flowers: 'plot-0',
  reeds: 'plot-4',
  boulder: 'plot-3',
}

// Ring by ring from the centre. A tree's place depends only on its order, so it never moves.
function* spiral(): Generator<[number, number]> {
  yield [0, 0]
  for (let r = 1; ; r++) {
    for (let x = -r; x <= r; x++) yield [x, -r]
    for (let y = -r + 1; y <= r; y++) yield [r, y]
    for (let x = r - 1; x >= -r; x--) yield [x, r]
    for (let y = r - 1; y > -r; y--) yield [-r, y]
  }
}

const grassGround = (gx: number, gy: number) => `plot-${Math.floor(rnd(gx, gy, 21) * PLOT_KINDS)}`

// Returns every plot in drawing order, so nearer things always cover farther ones.
export function layout(trees: readonly Tree[]): Plot[] {
  const used: Plot[] = []
  const open: Plot[] = []
  const cells = spiral()
  for (let c = 0, planted = 0; planted < trees.length; c++) {
    const [gx, gy] = cells.next().value as [number, number]
    const grass: Plot = { gx, gy, ground: grassGround(gx, gy), kind: 'grass' }
    const feature = FEATURES[c]
    if (feature) {
      const [decoration, arrives] = feature
      if (trees.length < arrives) open.push(grass)
      else
        used.push({
          gx,
          gy,
          ground: GROUND[decoration],
          kind: 'decoration',
          decoration,
        })
    } else if (c > 0 && rnd(gx, gy, 23) < OPEN_SHARE) {
      open.push(grass)
    } else {
      used.push({
        ...grass,
        kind: 'tree',
        tree: trees[planted],
        index: planted++,
      })
    }
  }

  // Land reaches one plot past the outermost tree on every side, so the island stays a whole square.
  const taken = new Set([...used, ...open].map((p) => `${p.gx},${p.gy}`))
  const reach = used.length
    ? Math.max(...used.map((p) => Math.max(Math.abs(p.gx), Math.abs(p.gy)))) + 1
    : 0
  const rest: Plot[] = []
  for (let gy = -reach; used.length && gy <= reach; gy++) {
    for (let gx = -reach; gx <= reach; gx++) {
      if (!taken.has(`${gx},${gy}`))
        rest.push({ gx, gy, ground: grassGround(gx, gy), kind: 'grass' })
    }
  }
  return [...used, ...open, ...rest].sort((a, b) => a.gx + a.gy - b.gx - b.gy)
}

const FLOWERY = new Set(['plot-1', 'plot-2', 'plot-5'])
const BEES_ARRIVE = 7
const MAX_BEES = 8

// Bees land on grass with flowers: one plot each, and the same plots as the garden grows.
export function beeSpots(plots: Plot[], treeCount: number) {
  if (treeCount < BEES_ARRIVE) return []
  return plots
    .filter((p) => p.kind === 'grass' && FLOWERY.has(p.ground))
    .sort((a, b) => rnd(a.gx, a.gy, 31) - rnd(b.gx, b.gy, 31))
    .slice(0, Math.min(MAX_BEES, Math.floor(treeCount / 4)))
}

export const arrivedPets = (treeCount: number) =>
  PET_ORDER.filter((id) => treeCount >= PET_ARRIVAL[id])

export type PetSpots = Partial<Record<PetId, Plot>>

// Pets still on open grass stay where they are, so a new tree doesn't scatter them. The rest land anywhere.
export function settlePets(plots: Plot[], treeCount: number, was: PetSpots = {}): PetSpots {
  const free = plots.filter((p) => p.kind === 'grass')
  const spots: PetSpots = {}
  const pets = arrivedPets(treeCount)
  for (const id of pets) {
    const old = was[id]
    const i = old ? free.findIndex((p) => p.gx === old.gx && p.gy === old.gy) : -1
    if (i >= 0) spots[id] = free.splice(i, 1)[0]
  }
  for (const id of pets) {
    if (!spots[id]) spots[id] = free.splice(Math.floor(Math.random() * free.length), 1)[0]
  }
  return spots
}
