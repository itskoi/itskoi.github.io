import { SPECIES_IDS } from '../session'
import { buildTree, HEIGHT, SPECIES, STAGES } from './trees'

describe.each(SPECIES_IDS)('%s', (id) => {
  it('gives a non-empty grid at every stage', () => {
    for (const stage of [0, 1, 2, 3]) expect(buildTree(id, stage).size).toBeGreaterThan(0)
  })

  it('has more cubes at each later stage than at the seed stage', () => {
    const seed = buildTree(id, 0).size
    for (const stage of [1, 2, 3]) expect(buildTree(id, stage).size).toBeGreaterThan(seed)
  })

  it('is the same on every build', () => {
    expect([...buildTree(id, 3).entries()]).toEqual([...buildTree(id, 3).entries()])
  })

  it('fits its sprite frame at every stage', () => {
    for (const stage of [0, 1, 2, 3]) {
      for (const { x, y, z } of buildTree(id, stage).values()) {
        expect(Math.abs((x - y) * 2)).toBeLessThanOrEqual(58)
        expect(x + y - (z + 1) * 2).toBeGreaterThanOrEqual(-100)
      }
    }
  })
})

it('has names for the ten trees and four stages', () => {
  expect(SPECIES_IDS.map((id) => SPECIES[id].name)).toEqual([
    'Phượng',
    'Mai',
    'Đào',
    'Đa',
    'Tre',
    'Dừa',
    'Bằng lăng',
    'Thông',
    'Bàng',
    'Chuối',
  ])
  expect(STAGES).toHaveLength(4)
  expect(HEIGHT).toHaveLength(4)
})
