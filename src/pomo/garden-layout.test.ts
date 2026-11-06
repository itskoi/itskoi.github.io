import { layout, PET_ARRIVAL, PET_ORDER, type Plot } from './garden-layout'
import type { Tree } from './session'

const makeTrees = (n: number): Tree[] =>
  Array.from({ length: n }, (_, i) => ({ plantedAt: i, stage: 3, species: 'mai' }))
const key = (p: Plot) => `${p.gx},${p.gy}`
const decorations = (plots: Plot[]) =>
  plots.flatMap((p) => (p.kind === 'decoration' ? [p.decoration] : []))
const petsIn = (plots: Plot[]) => plots.flatMap((p) => (p.kind === 'pet' ? [p.pet] : []))
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
  expect(first('buffalo')).toBe(17)
  expect(first('rocks')).toBe(18)
})

it('brings each pet at its specified count and keeps it after', () => {
  for (const pet of PET_ORDER) {
    expect(petsIn(layout(makeTrees(PET_ARRIVAL[pet] - 1)))).not.toContain(pet)
    for (const n of COUNTS.slice(PET_ARRIVAL[pet])) {
      expect(petsIn(layout(makeTrees(n)))).toContain(pet)
    }
  }
})

it('never lets a tree or decoration stand in front of a pet', () => {
  for (const n of COUNTS) {
    const plots = layout(makeTrees(n))
    for (const pet of plots.filter((p) => p.kind === 'pet')) {
      const blockers = plots.filter(
        (p) => (p.kind === 'tree' || p.kind === 'decoration') && p.gx >= pet.gx && p.gy >= pet.gy,
      )
      expect(blockers).toEqual([])
    }
  }
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

it('takes spiral plots in order, skipping decorations', () => {
  const treeAt = (i: number) => layout(makeTrees(9)).find((p) => p.kind === 'tree' && p.index === i)
  expect(treeAt(0)).toMatchObject({ gx: 0, gy: 0 })
  expect(treeAt(1)).toMatchObject({ gx: -1, gy: -1 })
  // Spiral position 6 holds the first meadow, so the seventh tree takes position 7.
  expect(layout(makeTrees(7)).find((p) => p.kind === 'decoration')).toMatchObject({ gx: 0, gy: 1 })
  expect(treeAt(6)).toMatchObject({ gx: -1, gy: 1 })
})
