import type { Species } from '../session'
import { type Grid, limb, lump, put, rnd } from './cubes'

type SpeciesInfo = {
  name: string
  en: string
  note: string
  seed: string
  bud?: string
  fallen?: string
  shadow: number
}
export const SPECIES: Record<Species, SpeciesInfo> = {
  phuong: {
    name: 'Phượng',
    en: 'Flame tree',
    note: 'The red tree that blooms as school ends for summer.',
    seed: '#8A5A34',
    bud: 'phuong',
    fallen: 'phuong',
    shadow: 36,
  },
  mai: {
    name: 'Mai',
    en: 'Yellow apricot',
    note: 'The yellow blossom of Tết in the south.',
    seed: '#6B4A2D',
    bud: 'mai',
    fallen: 'mai',
    shadow: 28,
  },
  dao: {
    name: 'Đào',
    en: 'Peach blossom',
    note: 'The pink blossom of Tết in the north.',
    seed: '#9A6A48',
    bud: 'dao',
    fallen: 'dao',
    shadow: 30,
  },
  da: {
    name: 'Đa',
    en: 'Banyan',
    note: 'The great tree that shades the village gate.',
    seed: '#5E7A3A',
    shadow: 40,
  },
  tre: {
    name: 'Tre',
    en: 'Bamboo',
    note: 'The bamboo that rings the villages.',
    seed: '#B5A36A',
    shadow: 26,
  },
  dua: {
    name: 'Dừa',
    en: 'Coconut palm',
    note: 'The palm of the Mekong Delta and the coast.',
    seed: '#5A3D24',
    shadow: 26,
  },
}
export const STAGES = ['Seed', 'Sprout', 'Sapling', 'Mature']
export const HEIGHT = [18, 34, 54, 78]
const SHAPES: Record<Species, (g: Grid, k: number) => void> = {
  phuong(g, k) {
    const L = (pts: number[][], a: number, b: number) =>
      limb(
        g,
        pts.map((q) => q.map((n) => n * k)),
        Math.max(a * k, 0.72),
        Math.max(b * k, 0.72),
        'bark',
      )
    const B = (...[x, y, z, r, rz, lift]: number[]) =>
      lump(g, x * k, y * k, z * k, r * k, rz * k, 'phuong', {
        under: 'leaf',
        bloom: 0.22,
        speck: ['leaf', 0.05],
        lift,
      })
    L(
      [
        [0, 0, 0],
        [0, 0, 11],
      ],
      2.5,
      1.7,
    )
    L(
      [
        [0, 0, 0],
        [4, 1, 0],
      ],
      1.3,
      0.7,
    )
    L(
      [
        [0, 0, 0],
        [-2, 4, 0],
      ],
      1.2,
      0.7,
    )
    L(
      [
        [0, 0, 0],
        [-3, -3, 0],
      ],
      1.1,
      0.7,
    )
    L(
      [
        [0, 0, 10],
        [5, -3, 16],
        [7, -5, 19],
      ],
      1.3,
      0.7,
    )
    L(
      [
        [0, 0, 10],
        [-5, 3, 16],
        [-7, 5, 19],
      ],
      1.3,
      0.7,
    )
    L(
      [
        [0, 0, 11],
        [2, 5, 18],
      ],
      1.1,
      0.7,
    )
    L(
      [
        [0, 0, 11],
        [-2, -5, 18],
      ],
      1.1,
      0.7,
    )
    L(
      [
        [0, 0, 11],
        [0, 0, 20],
      ],
      1.2,
      0.7,
    )
    ;[
      [7, -6, 21, 4.4, 2.5],
      [-7, 6, 21, 4.4, 2.5],
      [6, 5, 20.5, 4.6, 2.5],
      [-6, -5, 21, 4.6, 2.5],
      [6.5, -1, 22, 5, 2.8],
      [-6, 1.5, 22, 5, 2.8],
      [1, 6, 22, 5, 2.8],
      [-1, -6, 22.5, 5, 2.8],
    ].forEach((b) => {
      B(...b)
    })
    B(0, 0, 25, 7.4, 3, 0.05)
    if (k === 1) {
      B(3.5, -2.5, 27, 3.8, 1.9, 0.1)
      B(-3, 3, 27, 3.6, 1.9, 0.1)
    }
  },
  mai(g, k) {
    const L = (pts: number[][], a: number, b: number) =>
      limb(
        g,
        pts.map((q) => q.map((n) => n * k)),
        Math.max(a * k, 0.72),
        Math.max(b * k, 0.72),
        'plum',
      )
    const B = (...[x, y, z, r, rz]: number[]) =>
      lump(g, x * k, y * k, z * k, r * k, rz * k, 'mai', {
        holes: 0.34,
        fluff: 0.32,
        bloom: 0.2,
        speck: ['leaf', 0.07],
        lift: 0.03,
      })
    L(
      [
        [0, 0, 0],
        [-2, 2, 5],
        [1, -1, 11],
        [0, 0, 17],
      ],
      2.5,
      1,
    )
    L(
      [
        [0, 0, 0],
        [3, 1, 0],
      ],
      1.2,
      0.7,
    )
    L(
      [
        [0, 0, 0],
        [-2, -3, 0],
      ],
      1.1,
      0.7,
    )
    L(
      [
        [1, -1, 10],
        [5, -3, 13],
        [8, -6, 17],
      ],
      1.2,
      0.72,
    )
    L(
      [
        [-1, 1, 7],
        [-5, 2, 11],
        [-8, 5, 16],
      ],
      1.2,
      0.72,
    )
    L(
      [
        [-1, 1, 6],
        [-3, -3, 9],
        [-6, -4, 12],
      ],
      0.9,
      0.72,
    )
    L(
      [
        [1, -1, 9],
        [4, 3, 12],
        [6, 5, 14],
      ],
      0.9,
      0.72,
    )
    ;[
      [8, -6, 18.5, 3.9, 3],
      [-8, 5, 17.5, 4, 3],
      [0, 0, 20, 4.6, 3.8],
      [-6.5, -4.5, 13, 3.1, 2.4],
      [6.5, 5, 15, 3.2, 2.5],
      [3.5, -2, 15, 3.1, 2.6],
      [-3.5, 2, 14.5, 3, 2.5],
    ].forEach((b) => {
      B(...b)
    })
  },
  dao(g, k) {
    const L = (pts: number[][], a: number, b: number) =>
      limb(
        g,
        pts.map((q) => q.map((n) => n * k)),
        Math.max(a * k, 0.72),
        Math.max(b * k, 0.72),
        'plum',
      )
    const B = (...[x, y, z, r, rz, lift = 0]: number[]) =>
      lump(g, x * k, y * k, z * k, r * k, rz * k, 'dao', { holes: 0.08, bloom: 0.24, lift })
    L(
      [
        [0, 0, 0],
        [1, -1, 6],
        [0, 0, 11],
      ],
      2.3,
      1.4,
    )
    L(
      [
        [0, 0, 0],
        [3, 1, 0],
      ],
      1.1,
      0.7,
    )
    L(
      [
        [0, 0, 0],
        [-2, 3, 0],
      ],
      1.1,
      0.7,
    )
    L(
      [
        [0, 0, 9],
        [5, -3, 14],
      ],
      1,
      0.72,
    )
    L(
      [
        [0, 0, 9],
        [-5, 3, 14],
      ],
      1,
      0.72,
    )
    L(
      [
        [0, 0, 9],
        [1, 5, 13],
      ],
      0.9,
      0.72,
    )
    L(
      [
        [0, 0, 9],
        [-1, -5, 14],
      ],
      0.9,
      0.72,
    )
    ;[
      [6, -4, 15.5, 4.6, 3.3],
      [-6, 4, 15.5, 4.6, 3.3],
      [1.5, 6, 15, 4.4, 3.1],
      [-1.5, -6, 16, 4.4, 3.2],
    ].forEach((b) => {
      B(...b)
    })
    B(0, 0, 19, 6.8, 4.6, 0.03)
    B(3, -2, 23, 3.6, 2.6, 0.1)
    B(-3, 2.5, 22.5, 3.6, 2.6, 0.1)
  },
  da(g, k) {
    const L = (pts: number[][], a: number, b: number, p = 'bark') =>
      limb(
        g,
        pts.map((q) => q.map((n) => n * k)),
        Math.max(a * k, 0.72),
        Math.max(b * k, 0.72),
        p,
      )
    const B = (...[x, y, z, r, rz, lift = 0]: number[]) =>
      lump(g, x * k, y * k, z * k, r * k, rz * k, 'da', { lift, fluff: 0.16 })
    L(
      [
        [0, 0, 0],
        [0, 0, 15],
      ],
      3.4,
      2.4,
    )
    L(
      [
        [-3, 2, 0],
        [-1, 1, 14],
      ],
      1.7,
      1,
    )
    L(
      [
        [3, -1, 0],
        [1, 0, 14],
      ],
      1.5,
      1,
    )
    L(
      [
        [1, 3, 0],
        [0, 1, 13],
      ],
      1.3,
      1,
    )
    L(
      [
        [0, 0, 0],
        [5, 1, 0],
      ],
      1.5,
      0.7,
    )
    L(
      [
        [0, 0, 0],
        [-1, 5, 0],
      ],
      1.5,
      0.7,
    )
    L(
      [
        [0, 0, 0],
        [-4, -3, 0],
      ],
      1.3,
      0.7,
    )
    if (k === 1)
      [
        [-8, -3, 0],
        [7, -6, 3],
        [8, 3, 0],
        [-4, 8, 0],
        [-9, 3, 5],
        [2, 8, 2],
        [-2, -8, 4],
        [6, 7, 0],
        [5, 0, 6],
        [-5, 1, 3],
        [-6, -7, 6],
        [8, -3, 7],
      ].forEach(([x, y, z0]) => {
        L(
          [
            [x + 0.5, y + 0.5, z0],
            [x + 0.5, y + 0.5, 19],
          ],
          0.8,
          0.72,
          'rootwood',
        )
      })
    ;[
      [7, -3, 20, 5.8, 3.6],
      [-7, 3, 20, 5.8, 3.6],
      [2, 7, 20, 5.8, 3.4],
      [-2, -7, 20.5, 5.8, 3.6],
      [6, 6, 18.5, 4.4, 2.8],
      [-6, -6, 19, 4.4, 2.8],
      [8, -7, 19, 3.8, 2.4],
      [-8, 7, 19, 3.8, 2.4],
    ].forEach((b) => {
      B(...b)
    })
    B(0, 0, 24, 8, 4.6, 0.02)
    B(4, -2.5, 28.5, 4.4, 2.6, 0.08)
    B(-3.5, 3, 28, 4.6, 2.6, 0.08)
    B(0, -5, 26, 3.8, 2.3, 0.05)
  },
  tre(g, k) {
    const culms = [
      [0, 0, 38, 0.5, -0.5],
      [-3, -1, 35, -3, -0.5],
      [0, -3, 36, 0.5, -3.5],
      [2, 0, 34, 3.5, 0.5],
      [-1, 2, 32, -0.5, 3.5],
      [3, -3, 29, 4, -3],
      [-4, 2, 27, -4, 2.5],
    ]
    ;(k < 1 ? culms.slice(0, 4) : culms).forEach(([x, y, h, bx, by], ci) => {
      const H = Math.round(h * k)
      for (let z = 0; z < H; z++) {
        const t = z / H,
          cx = x * k + bx * k * t * t,
          cy = y * k + by * k * t * t
        put(
          g,
          Math.round(cx),
          Math.round(cy),
          z,
          'culm',
          z % 5 === 4 ? 0.95 : 0.42 + rnd(ci, z) * 0.12 - (x + y > 2 ? 0.05 : 0),
        )
      }
      // Thin sprays high on each stalk, so the stalks stay visible and the clump stays slender.
      for (let z = H * 0.55; z < H + 1; z += 3.4) {
        const t = z / H,
          cx = x * k + bx * k * t * t,
          cy = y * k + by * k * t * t
        for (let side = 0; side < 2; side++) {
          const a = rnd(ci, Math.round(z), side, 4) * 6.28,
            len = (2.4 + rnd(ci, Math.round(z), side, 5) * 2.6) * Math.max(k, 0.7)
          for (let j = 1; j <= len; j++) {
            const px = Math.round(cx + Math.cos(a) * j),
              py = Math.round(cy + Math.sin(a) * j),
              pz = Math.round(z + 0.7 * j - 0.24 * j * j),
              v = 0.34 + t * 0.3 + rnd(px, py, pz) * 0.22
            put(g, px, py, pz, 'bamboo', v)
          }
        }
      }
    })
  },
  dua(g, k) {
    const q = (p: number[]) => p.map((n) => n * k),
      T = q([2, -2, 31])
    lump(g, -2 * k, 2 * k, 0, 3 * k + 0.6, 1.8 * k + 0.4, 'tan', { fluff: 0.05 })
    limb(
      g,
      [
        [-2, 2, 0],
        [-1.6, 1.6, 10],
        [-0.4, 0.4, 20],
        [2, -2, 31],
      ].map(q),
      Math.max(1.7 * k, 0.8),
      Math.max(1.05 * k, 0.72),
      'tan',
      { band: 3 },
    )
    const kk = Math.max(k, 0.55),
      fronds = k < 1 ? 6 : 9
    for (let i = 0; i < fronds; i++) {
      const a = (i * 6.283) / fronds + rnd(i, 21) * 0.35,
        ca = Math.cos(a),
        sa = Math.sin(a),
        len = (11.5 + rnd(i, 22) * 2.2) * kk,
        rise = (3.5 + rnd(i, 23) * 2.5) * kk,
        fall = (13 + rnd(i, 24) * 3) * kk
      const steps = Math.ceil(len * 1.5)
      for (let s = 0; s <= steps; s++) {
        const t = s / steps,
          x = T[0] + ca * len * t,
          y = T[1] + sa * len * t,
          z = T[2] + 1 + rise * t * 1.4 - fall * t * t
        put(g, Math.round(x), Math.round(y), Math.round(z), 'palm', 0.66 + rnd(i, s) * 0.14)
        if (s % 2) continue
        const w = Math.round(2.4 * kk * Math.sin(Math.PI * Math.min(1, t + 0.12)))
        for (let e = -w; e <= w; e++) {
          if (e)
            put(
              g,
              Math.round(x - sa * e),
              Math.round(y + ca * e),
              Math.round(z - 1 - Math.abs(e) * 0.7),
              'palm',
              0.32 + t * 0.24 + rnd(i, s, e) * 0.2 + (e > 0 ? 0.08 : -0.04),
            )
        }
      }
    }
    lump(g, T[0], T[1], T[2] + 1, 2 * kk, 1.6 * kk, 'palm', { fluff: 0.05, lift: 0.06 })
    if (k === 1)
      [
        [1.6, 0.4],
        [-0.4, 1.8],
        [-1.8, -0.2],
        [0.8, -1.6],
        [2, 1.8],
      ].forEach(([dx, dy], i) => {
        lump(g, T[0] + dx, T[1] + dy, T[2] - 1.6 - (i % 2), 1.45, 1.45, 'coco', { fluff: 0.02 })
      })
  },
}
const soilBed = (g: Grid, r: number) => {
  lump(g, 0, 0, 0, r, 1.5, 'soil', { fluff: 0.3, lift: -0.04 })
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + rnd(i, 31),
      R = r - 1 + rnd(i, 32) * 2
    put(
      g,
      Math.round(Math.cos(a) * R),
      Math.round(Math.sin(a) * R),
      1,
      'stone',
      0.5 + rnd(i, 33) * 0.4,
    )
  }
}
export function buildTree(id: Species, stage: number): Grid {
  const g: Grid = new Map(),
    sp = SPECIES[id]
  if (stage === 0) {
    soilBed(g, 5.5)
    lump(g, 0, 0, 0, 3.6, 3, 'soil', { fluff: 0.12 })
    lump(g, -0.5, 0.5, 3.4, 1.5, 1.1, sp.seed, { fluff: 0.02, lift: 0.08 })
  } else if (stage === 1) {
    soilBed(g, 6)
    if (id === 'tre') {
      for (let z = 0; z < 12; z++) {
        const r = 2.3 - z * 0.17
        lump(g, 0, 0, z + 0.5, Math.max(r, 0.72), 0.9, z > 8 ? 'bamboo' : 'sheath', {
          fluff: 0.02,
          lift: z % 3 ? 0 : -0.1,
        })
      }
      ;[
        [1, -1, 12],
        [-1, 1, 12],
        [0, 0, 13],
        [2, -2, 13],
        [-2, 1, 13],
      ].forEach(([x, y, z]) => {
        put(g, x, y, z, 'bamboo', 0.75)
      })
    } else if (id === 'dua') {
      lump(g, 0, 0, 2.4, 3.1, 2.8, 'coco', { fluff: 0.03 })
      for (let a = 0; a < 5; a++)
        for (let j = 0; j < 9; j++)
          put(
            g,
            Math.round(Math.cos(a * 1.26 + 0.4) * j * 0.85),
            Math.round(Math.sin(a * 1.26 + 0.4) * j * 0.85),
            Math.round(5 + j * 1.4 - j * j * 0.12),
            'palm',
            0.4 + j * 0.05,
          )
    } else {
      limb(
        g,
        [
          [0, 0, 0],
          [0, 0, 6],
          [1, -1, 10],
        ],
        1,
        0.72,
        'leaf',
        { lift: 0.05 },
      )
      lump(g, -3.4, 1.4, 9.6, 3.1, 1.2, 'leaf', { fluff: 0.08, lift: 0.1 })
      lump(g, 3.2, -3.4, 11, 3.1, 1.2, 'leaf', { fluff: 0.08, lift: 0.1 })
      lump(g, 2, 1.4, 8, 2.2, 1, 'leaf', { fluff: 0.08 })
      lump(g, 1, -1, 12, 1.6, 1.6, sp.bud || 'leaf', { fluff: 0.05, lift: 0.1 })
    }
  } else if (stage === 2) {
    soilBed(g, 6.5)
    SHAPES[id](g, id === 'tre' ? 0.6 : id === 'dua' ? 0.52 : 0.58)
  } else {
    SHAPES[id](g, 1)
    if (sp.fallen)
      for (let i = 0; i < 20; i++) {
        const a = rnd(i, 41) * 6.28,
          r = 3.5 + rnd(i, 42) * 3.4
        put(
          g,
          Math.round(Math.cos(a) * r),
          Math.round(Math.sin(a) * r),
          0,
          sp.fallen,
          0.6 + rnd(i, 43) * 0.3,
        )
      }
  }
  return g
}
