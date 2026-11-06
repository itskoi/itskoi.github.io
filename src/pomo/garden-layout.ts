import { rnd } from './art/cubes'
import type { PetId } from './art/pets'
import type { Tree } from './session'

export type Decoration = 'pond' | 'rocks' | 'meadow' | 'buffalo'
type Spot = { gx: number; gy: number; ground: string }
export type Plot = Spot &
  (
    | { kind: 'tree'; tree: Tree; index: number }
    | { kind: 'decoration'; decoration: Decoration }
    | { kind: 'pet'; pet: PetId }
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
}
export const PET_ORDER = Object.keys(PET_ARRIVAL) as PetId[]

// Spiral positions on the front edges of each ring, so tall trees don't hide them.
const FEATURES: Record<number, Decoration> = {
  6: 'meadow',
  16: 'pond',
  18: 'buffalo',
  20: 'rocks',
  33: 'meadow',
  35: 'rocks',
  41: 'pond',
  61: 'meadow',
  63: 'pond',
  68: 'buffalo',
  70: 'rocks',
  95: 'meadow',
  98: 'rocks',
  106: 'pond',
}
const GROUND: Record<Decoration, string> = {
  pond: 'pond-ground',
  rocks: 'plot-1',
  meadow: 'plot-2',
  buffalo: 'plot-3',
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

const grassGround = (gx: number, gy: number) => `plot-${Math.floor(rnd(gx, gy, 21) * 4)}`

// Returns every plot in drawing order, so nearer things always cover farther ones.
export function layout(trees: readonly Tree[]): Plot[] {
  const used: Plot[] = []
  const cells = spiral()
  for (let c = 0, planted = 0; planted < trees.length; c++) {
    const [gx, gy] = cells.next().value as [number, number]
    const decoration = FEATURES[c]
    used.push(
      decoration
        ? { gx, gy, ground: GROUND[decoration], kind: 'decoration', decoration }
        : {
            gx,
            gy,
            ground: grassGround(gx, gy),
            kind: 'tree',
            tree: trees[planted],
            index: planted++,
          },
    )
  }

  const taken = new Set(used.map((p) => `${p.gx},${p.gy}`))
  const edge = new Map<string, [number, number]>()
  for (const { gx, gy } of used) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const key = `${gx + dx},${gy + dy}`
        if (!taken.has(key)) edge.set(key, [gx + dx, gy + dy])
      }
    }
  }
  const grass = [...edge.values()]

  // Pets sit on grass with nothing in front of them, spread along the front of the garden.
  const pets = PET_ORDER.filter((id) => trees.length >= PET_ARRIVAL[id])
  const front = grass
    .filter(([x, y]) => !used.some((p) => p.gx >= x && p.gy >= y))
    .sort((a, b) => a[0] - a[1] - b[0] + b[1])
  const petAt = new Map(
    pets.map((pet, i) => {
      const [x, y] = front[Math.floor(((i + 0.5) * front.length) / pets.length)]
      return [`${x},${y}`, pet]
    }),
  )

  const rest = grass.map(([gx, gy]): Plot => {
    const pet = petAt.get(`${gx},${gy}`)
    const spot = { gx, gy, ground: grassGround(gx, gy) }
    return pet ? { ...spot, kind: 'pet', pet } : { ...spot, kind: 'grass' }
  })
  return [...used, ...rest].sort((a, b) => a.gx + a.gy - b.gx - b.gy)
}
