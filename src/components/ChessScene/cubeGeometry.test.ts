import { describe, expect, it } from 'vitest'
import { CUBE_GRID, LATTICE_SPACING, latticeHomes, smallCubeEdges } from './cubeGeometry'

describe('latticeHomes', () => {
  it('places one small cube per grid cell — 4×4×4 = 64 homes', () => {
    expect(latticeHomes()).toHaveLength(CUBE_GRID ** 3)
  })

  it('centers the lattice on the origin (symmetric ± extents)', () => {
    const homes = latticeHomes()
    const half = ((CUBE_GRID - 1) / 2) * LATTICE_SPACING
    for (const h of homes) {
      for (const v of [h.x, h.y, h.z]) {
        expect(Math.abs(v)).toBeLessThanOrEqual(half + 1e-6)
      }
    }
    // Furthest home is a corner at ±half on every axis.
    const corner = homes[0]
    expect(Math.abs(corner.x)).toBeCloseTo(half, 5)
  })
})

describe('smallCubeEdges', () => {
  it('returns a line-segment geometry (the cube wireframe)', () => {
    const geo = smallCubeEdges(1)
    expect(geo.attributes.position).toBeDefined()
    expect(geo.attributes.position.count).toBeGreaterThan(0)
    geo.dispose()
  })
})
