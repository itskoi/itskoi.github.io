import * as THREE from 'three'

// The "cube" is a 4×4×4 lattice of small wireframe cubes with gaps between them.
export const CUBE_GRID = 3
export const SMALL_CUBE_SIZE = 1.5
// Center-to-center distance; the gap between cubes is LATTICE_SPACING - SMALL_CUBE_SIZE.
export const LATTICE_SPACING = 1.5

/** The 12 edges of one small cube — a clean wireframe cube (no diagonals). */
export function smallCubeEdges(size: number = SMALL_CUBE_SIZE): THREE.BufferGeometry {
  const box = new THREE.BoxGeometry(size, size, size)
  const edges = new THREE.EdgesGeometry(box)
  box.dispose()
  return edges
}

/** The CUBE_GRID³ home positions of the lattice, centered on the origin. */
export function latticeHomes(spacing: number = LATTICE_SPACING): THREE.Vector3[] {
  const homes: THREE.Vector3[] = []
  const half = (CUBE_GRID - 1) / 2
  for (let i = 0; i < CUBE_GRID; i++) {
    for (let j = 0; j < CUBE_GRID; j++) {
      for (let k = 0; k < CUBE_GRID; k++) {
        homes.push(
          new THREE.Vector3((i - half) * spacing, (j - half) * spacing, (k - half) * spacing),
        )
      }
    }
  }
  return homes
}
