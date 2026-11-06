import { type Grid, K, limb, lump, paint, put, rnd, tone } from './cubes'

const cubesOf = (g: Grid) => [...g.entries()]

function fakeContext() {
  const painted: number[][][] = []
  let path: number[][] = []
  const ctx = {
    lineWidth: 0,
    fillStyle: '',
    strokeStyle: '',
    beginPath: () => {
      path = []
    },
    moveTo: (x: number, y: number) => path.push([x, y]),
    lineTo: (x: number, y: number) => path.push([x, y]),
    closePath: () => {},
    fill: () => painted.push(path),
    stroke: () => {},
  }
  return { ctx: ctx as unknown as CanvasRenderingContext2D, painted }
}

describe('grid helpers', () => {
  it('gives the same cubes for the same input', () => {
    const build = () => {
      const g: Grid = new Map()
      lump(g, 1, 2, 3, 4, 3, 'leaf', { bloom: 0.2, holes: 0.1, speck: ['bark', 0.1] })
      limb(
        g,
        [
          [0, 0, 0],
          [3, 1, 8],
        ],
        2,
        1,
        'bark',
        { band: 3 },
      )
      return cubesOf(g)
    }
    expect(build().length).toBeGreaterThan(0)
    expect(build()).toEqual(build())
    expect(rnd(1, 2, 3)).toBe(rnd(1, 2, 3))
  })

  it('never places a cube below the ground', () => {
    const g: Grid = new Map()
    lump(g, 0, 0, 0, 4, 4, 'soil')
    put(g, 0, 0, -1, 'soil', 0.5)
    expect([...g.values()].every((c) => c.z >= 0)).toBe(true)
    expect(g.has(K(0, 0, -1))).toBe(false)
  })

  it('blends palette tones and accepts a plain colour', () => {
    expect(tone('leaf', 0)).toBe('rgb(29,71,45)')
    expect(tone('#102030', 0.5)).toBe('rgb(16,32,48)')
  })
})

describe('paint', () => {
  const grid = (...cubes: number[][]): Grid => {
    const g: Grid = new Map()
    for (const [x, y, z] of cubes) put(g, x, y, z, 'leaf', 0.5)
    return g
  }

  it('paints three faces of a lone cube', () => {
    const { ctx, painted } = fakeContext()
    paint(ctx, grid([0, 0, 0]), 2)
    expect(painted).toHaveLength(3)
  })

  it('does not paint faces hidden by a neighbouring cube', () => {
    const { ctx, painted } = fakeContext()
    // A pair side by side along x: the left cube's right face and nothing else is hidden.
    paint(ctx, grid([0, 0, 0], [1, 0, 0]), 2)
    expect(painted).toHaveLength(5)

    const stacked = fakeContext()
    paint(stacked.ctx, grid([0, 0, 0], [0, 0, 1]), 2) // the lower cube's top is hidden
    expect(stacked.painted).toHaveLength(5)

    const behind = fakeContext()
    paint(behind.ctx, grid([0, 0, 0], [0, 1, 0]), 2) // the back cube's left face is hidden
    expect(behind.painted).toHaveLength(5)
  })

  it('paints a fully enclosed cube not at all', () => {
    const { ctx, painted } = fakeContext()
    paint(ctx, grid([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 2)
    // Four cubes have 12 faces between them. The enclosed one shows none of its 3.
    expect(painted).toHaveLength(9)
  })
})
