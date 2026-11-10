import { beeSpots, layout, PET_ARRIVAL, PET_ORDER, type Plot, settlePets } from './garden-layout'
import type { Tree } from './session'

const makeTrees = (n: number): Tree[] =>
  Array.from({ length: n }, (_, i) => ({ plantedAt: i, stage: 3, species: 'mai' }))
const key = (p: Plot) => `${p.gx},${p.gy}`
const decorations = (plots: Plot[]) =>
  plots.flatMap((p) => (p.kind === 'decoration' ? [p.decoration] : []))
const petsAt = (n: number) => Object.keys(settlePets(layout(makeTrees(n)), n))
const COUNTS = Array.from({ length: 301 }, (_, n) => n)

it('gives no plots to an empty garden', () => {
  expect(layout([])).toEqual([])
})

it('never puts two things on one plot', () => {
  for (const n of COUNTS) {
    const plots = layout(makeTrees(n))
    expect(new Set(plots.map(key)).size).toBe(plots.length)
    expect(plots.filter((p) => p.kind === 'tree')).toHaveLength(n)
  }
})

it('keeps every tree and decoration on its plot as trees are added', () => {
  const place = new Map<string, string>()
  for (const n of COUNTS) {
    for (const p of layout(makeTrees(n))) {
      if (p.kind !== 'tree' && p.kind !== 'decoration') continue
      const id = p.kind === 'tree' ? `tree-${p.index}` : `decor-${key(p)}-${p.decoration}`
      expect(place.get(id) ?? key(p)).toBe(key(p))
      place.set(id, key(p))
    }
  }
})

it('brings the first meadow, pond, and rocks at 7, 16, and 18 trees', () => {
  const first = (decoration: string) =>
    COUNTS.find((n) => decorations(layout(makeTrees(n))).includes(decoration as never))
  expect(first('meadow')).toBe(7)
  expect(first('pond')).toBe(16)
  expect(first('flowers')).toBe(17)
  expect(first('reeds')).toBe(32)
  expect(first('boulder')).toBe(33)
  expect(first('rocks')).toBe(18)
})

it('brings each pet at its specified count and keeps it after', () => {
  for (const pet of PET_ORDER) {
    expect(petsAt(PET_ARRIVAL[pet] - 1)).not.toContain(pet)
    for (const n of COUNTS.slice(PET_ARRIVAL[pet])) expect(petsAt(n)).toContain(pet)
  }
})

it('puts every pet on its own plot of open grass', () => {
  for (const n of COUNTS) {
    const plots = layout(makeTrees(n))
    const spots = Object.values(settlePets(plots, n))
    expect(new Set(spots).size).toBe(spots.length)
    for (const spot of spots) expect(spot?.kind).toBe('grass')
  }
})

it('spawns pets anywhere in the garden, among the trees as well as at its edge', () => {
  const plots = layout(makeTrees(60))
  const trees = plots.filter((p) => p.kind === 'tree')
  const inside = (p: Plot) =>
    trees.some((t) => t.gx > p.gx && t.gy > p.gy) && trees.some((t) => t.gx < p.gx && t.gy < p.gy)
  const seen = new Set<string>()
  for (let i = 0; i < 200; i++) {
    for (const spot of Object.values(settlePets(plots, 60))) {
      if (spot && inside(spot)) seen.add(key(spot))
    }
  }
  expect(seen.size).toBeGreaterThan(10)
})

it('leaves a pet where it is when a new tree does not take its plot', () => {
  const before = layout(makeTrees(20))
  const was = settlePets(before, 20)
  const after = layout(makeTrees(21))
  const spots = settlePets(after, 21, was)
  for (const [pet, spot] of Object.entries(was)) {
    const still = after.find((p) => key(p) === key(spot) && p.kind === 'grass')
    if (still) expect(spots[pet as keyof typeof spots]).toBe(still)
  }
})

it('scatters trees, leaving grass between them', () => {
  for (const n of [20, 60, 300]) {
    const plots = layout(makeTrees(n))
    const trees = plots.filter((p) => p.kind === 'tree')
    const ours = new Set(trees.map(key))
    const crowded = trees.filter((t) =>
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].every(([dx, dy]) => ours.has(`${t.gx + dx},${t.gy + dy}`)),
    )
    expect(crowded.length / trees.length).toBeLessThan(0.25)
    expect(plots.filter((p) => p.kind === 'grass').length).toBeGreaterThan(n * 0.6)
  }
})

it('lands bees on open grass with flowers, one to a plot, and caps them', () => {
  for (const n of [7, 10, 40, 300]) {
    const plots = layout(makeTrees(n))
    const landed = beeSpots(plots, n)
    expect(landed.length).toBeGreaterThan(0)
    expect(new Set(landed).size).toBe(landed.length)
    for (const plot of landed) expect(plot.kind).toBe('grass')
  }
  expect(beeSpots(layout(makeTrees(300)), 300)).toHaveLength(8)
  expect(beeSpots(layout(makeTrees(6)), 6)).toEqual([])
})

it('surrounds the garden with grass and draws back to front', () => {
  for (const n of [1, 7, 50, 300]) {
    const plots = layout(makeTrees(n))
    const all = new Set(plots.map(key))
    for (const p of plots.filter((q) => q.kind === 'tree' || q.kind === 'decoration')) {
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, -1],
      ]) {
        expect(all.has(`${p.gx + dx},${p.gy + dy}`)).toBe(true)
      }
    }
    const depths = plots.map((p) => p.gx + p.gy)
    expect(depths).toEqual([...depths].sort((a, b) => a - b))
  }
})

it('starts at the centre and keeps decorations on their spiral plots', () => {
  expect(layout(makeTrees(9)).find((p) => p.kind === 'tree' && p.index === 0)).toMatchObject({
    gx: 0,
    gy: 0,
  })
  // Spiral position 6 holds the first meadow.
  expect(layout(makeTrees(7)).find((p) => p.kind === 'decoration')).toMatchObject({ gx: 0, gy: 1 })
})
