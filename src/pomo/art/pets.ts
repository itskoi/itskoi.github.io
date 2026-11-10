import { type Grid, type LumpOptions, limb, lump, put, rnd } from './cubes'

export const PET_IDS = [
  'corgi',
  'golden',
  'shiba',
  'yellow',
  'white',
  'black',
  'buffalo',
  'bear',
  'monkey',
  'elephant',
] as const
export type PetId = (typeof PET_IDS)[number]
const PART_NAMES = ['tail', 'body', 'earsBack', 'head', 'ears', 'lids', 'tongue'] as const
export type PartName = (typeof PART_NAMES)[number]
export type PetParts = Record<PartName, Grid>
export const WALK_PARTS = ['tail', 'legsA', 'legsB', 'body'] as const
export type WalkParts = Record<(typeof WALK_PARTS)[number], Grid>
export const PET_FRAME = { x: -36, y: -46, w: 72, h: 62, scale: 6 }
type Pet = {
  name: string
  tu: number
  tailAt: number[]
  tail: string
  tailFront?: boolean
  headAt: number[]
  headMove: string
  earMove?: string
  draw: (p: PetParts) => void
  // Walking reuses the sitting head, moved `head` cubes forward and up onto a body on four legs.
  walk: { head: [number, number]; tailAt: number[]; draw: (p: WalkParts) => void }
}
type Stance = {
  y0: number
  y1: number
  legH: number
  r: number
  rz: number
  legR: number
  w: number
  paw: string
  coat?: LumpOptions
}
// A body on four legs. Diagonal legs share a part, so they can step together like a trot.
function standing(p: WalkParts, coat: string, chest: string, s: Stance) {
  for (const side of [-1, 1])
    for (const front of [false, true]) {
      const y = front ? s.y1 + 1.5 : s.y0 - 1
      limb(
        side > 0 === front ? p.legsB : p.legsA,
        [
          [side * s.w, y, 0],
          [side * s.w, y, s.legH + 1],
        ],
        s.legR,
        s.legR,
        s.paw,
        { lift: 0.06 },
      )
    }
  const zc = s.legH + s.rz * 0.75,
    soft = { fluff: 0.1, ...s.coat }
  lump(p.body, 0, s.y0, zc, s.r, s.rz, coat, soft)
  lump(p.body, 0, s.y1, zc + 0.2, s.r, s.rz, coat, soft)
  lump(p.body, 0, s.y1 + s.r * 0.75, zc - 0.6, s.r * 0.84, s.rz, chest, { fluff: 0.2 })
}
// A box with its edges cut off, for shapes that must stay flat and square where a lump would go round.
function block(
  g: Grid,
  [x0, x1]: number[],
  [y0, y1]: number[],
  [z0, z1]: number[],
  p: string,
  lift = 0,
) {
  for (let z = z0; z < z1; z++)
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const edges = [x === x0 || x === x1 - 1, y === y0 || y === y1 - 1, z === z0 || z === z1 - 1]
        if (edges.filter(Boolean).length > 1) continue
        put(
          g,
          x,
          y,
          z,
          p,
          0.5 + lift + ((z - z0) / (z1 - z0)) * 0.14 + (rnd(x, y, z, 3) - 0.5) * 0.12,
        )
      }
}
// A flat ear, facing the viewer.
function disc(g: Grid, cx: number, y: number, cz: number, rx: number, rz: number, p: string) {
  for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x + 0.5 - cx) / rx,
        dz = (z + 0.5 - cz) / rz
      if (dx * dx + dz * dz <= 1) put(g, x, y, z, p, 0.52 + dz * 0.2 - dx * 0.1)
    }
}
const blush = (h: Grid, x: number, y: number, z: number) => {
  for (const cx of [x, -x - 1]) put(h, cx, y, z, 'pink', 0.42)
}

const DARK = '#17151A'
const eyes = (parts: PetParts, y: number, z: number, ex: number, color: string, lid: string) => {
  for (const s of [-1, 1]) {
    const x = s < 0 ? -ex - 1 : ex
    for (const [dx, dz] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      put(parts.head, x + dx, y, z + dz, color, 0.5)
      put(parts.lids, x + dx, y, z + dz, lid, 0.46)
    }
    put(parts.head, x, y, z + 1, '#FFFFFF', 0.9) // catchlight, so the eye looks alive
    if (color !== DARK) put(parts.head, x + 1, y, z, DARK, 0.5) // pupil on a coloured eye
  }
}
function earPair(
  g: Grid,
  y: number,
  z0: number,
  h: number,
  wide: number,
  x: number,
  coat: string,
  inner: string,
) {
  for (const s of [-1, 1])
    for (let i = 0; i < h; i++) {
      const r = ((h - i) / h) * wide + 0.5
      lump(g, s * x, y, z0 + i + 0.5, r, 0.8, coat, { fluff: 0 })
      if (inner && i < h - 1)
        lump(g, s * x, y + r * 0.55, z0 + i + 0.5, Math.max(r * 0.5, 0.6), 0.7, inner, { fluff: 0 })
    }
}
function dogBody(b: Grid, coat: string, chest: string) {
  const soft = { fluff: 0.12 }
  lump(b, 0, -3.5, 4, 5, 4.2, coat, soft)
  for (const s of [-1, 1]) lump(b, s * 3.6, -0.5, 1.3, 2.1, 1.4, chest, soft)
  lump(b, 0, -1, 9.5, 4.4, 6.6, coat, soft)
  lump(b, 0, 2.4, 9, 3.1, 5, chest, { fluff: 0.24 })
  for (const s of [-1, 1]) {
    limb(
      b,
      [
        [s * 2, 3, 0],
        [s * 2, 2.6, 8],
      ],
      1.5,
      1.4,
      chest,
      { lift: 0.1 },
    )
    lump(b, s * 2, 4.2, 1, 1.8, 1.2, chest, soft)
  }
}
function sittingDog(parts: PetParts, coat: string, chest: string, muzzle: string) {
  const h = parts.head
  dogBody(parts.body, coat, chest)
  lump(h, 0, 2, 18.5, 6, 5.4, coat, { fluff: 0.08, lift: 0.04 })
  lump(h, 0, 7, 16.4, 3, 2.4, muzzle, { fluff: 0, lift: 0.08 })
  for (const x of [-1, 0]) put(h, x, 10, 17, '#1B1A1E', 0.5)
  eyes(parts, 7, 20, 2, DARK, coat)
}
type CatLook = {
  coat: string
  stripe?: [number, string]
  muzzle: string
  eye: string
  inner: string
}
function drawCat(p: PetParts, pet: CatLook) {
  const c: LumpOptions = { fluff: 0.08, stripe: pet.stripe }
  limb(
    p.tail,
    [
      [2.5, -4.5, 1],
      [5.5, -2, 1],
      [6, 1.5, 1],
      [4.5, 3.8, 1],
    ],
    1.3,
    1,
    pet.coat,
  )
  lump(p.body, 0, -2, 3.4, 4.1, 3.5, pet.coat, c)
  lump(p.body, 0, -0.5, 7.4, 3.3, 5.2, pet.coat, c)
  for (const s of [-1, 1]) {
    limb(
      p.body,
      [
        [s * 1.6, 2, 0],
        [s * 1.6, 1.8, 6],
      ],
      1.2,
      1.1,
      pet.coat,
      { lift: 0.06 },
    )
    lump(p.body, s * 1.6, 3, 0.9, 1.5, 0.9, pet.muzzle === 'cream' ? 'cream' : pet.coat, {
      fluff: 0,
      lift: 0.08,
    })
  }
  lump(p.head, 0, 1.5, 14, 5.4, 4.4, pet.coat, { ...c, lift: 0.05 })
  lump(p.head, 0, 5.8, 12.8, 1.9, 1.4, pet.muzzle, { fluff: 0, lift: 0.1 })
  put(p.head, -1, 7, 13, 'pink', 0.35)
  put(p.head, 0, 7, 13, 'pink', 0.35)
  eyes(p, 6, 14, 2, pet.eye, pet.coat)
  earPair(p.ears, 1, 17, 5, 1.9, 3.4, pet.coat, pet.inner)
}
const cat = (name: string, tail: string, headMove: string, look: CatLook): Pet => ({
  name,
  tu: 0.78,
  tailAt: [2.5, -4.5, 1],
  tail,
  tailFront: true,
  headAt: [0, 1, 10],
  headMove,
  draw: (p) => drawCat(p, look),
  walk: {
    head: [2.5, -2.5],
    tailAt: [0, -8, 8],
    draw(p) {
      standing(p, look.coat, look.coat, {
        y0: -5,
        y1: -1,
        legH: 4,
        r: 3.4,
        rz: 3,
        legR: 1.1,
        w: 1.7,
        paw: look.muzzle === 'cream' ? 'cream' : look.coat,
        coat: { fluff: 0.08, stripe: look.stripe },
      })
      limb(
        p.tail,
        [
          [0, -8, 8],
          [0, -10.5, 12],
          [0, -9.5, 16.5],
        ],
        1.2,
        0.9,
        look.coat,
      )
    },
  },
})
export const PETS: Record<PetId, Pet> = {
  corgi: {
    name: 'Corgi',
    tu: 0.82,
    tailAt: [0, -7, 3],
    tail: 'wag-fast',
    headAt: [0, 1, 14],
    headMove: 'bob',
    draw(p) {
      lump(p.tail, 0, -8.6, 3, 1.7, 1.7, 'corgi', { fluff: 0 })
      sittingDog(p, 'corgi', 'cream', 'cream')
      lump(p.head, 0, 7.2, 20.8, 1.2, 2.2, 'cream', { fluff: 0, lift: 0.1 }) // white blaze up the forehead
      eyes(p, 7, 20, 2, DARK, 'corgi')
      earPair(p.ears, 1.6, 22, 7, 1.9, 3.8, 'corgi', 'pink')
    },
    walk: {
      head: [3, -4.3],
      tailAt: [0, -9, 8],
      draw(p) {
        // Short legs and a long back: the corgi's whole look.
        standing(p, 'corgi', 'cream', {
          y0: -6,
          y1: -1,
          legH: 3,
          r: 4.4,
          rz: 3.8,
          legR: 1.5,
          w: 2.5,
          paw: 'cream',
        })
        lump(p.tail, 0, -11, 8, 1.7, 1.7, 'corgi', { fluff: 0 })
      },
    },
  },
  golden: {
    // The head is square on purpose: a flat skull, a broad muzzle below it, and folded ears. A round head reads as a poodle.
    name: 'Golden retriever',
    tu: 0.98,
    tailAt: [2, -6, 2],
    tail: 'wag',
    headAt: [0, 1, 14],
    headMove: 'pant',
    draw(p) {
      const h = p.head,
        fur = 'goldenRich',
        light = 'goldenLight'
      limb(
        p.tail,
        [
          [3, -6.5, 1.2],
          [8, -9, 0.8],
          [13, -8.5, 2],
        ],
        2,
        0.8,
        light,
      )
      limb(
        p.tail,
        [
          [2, -6, 2],
          [7, -8.5, 2],
          [12.5, -8, 3.4],
        ],
        1.5,
        0.8,
        fur,
      )
      dogBody(p.body, fur, light)
      block(h, [-5, 5], [-3, 5], [15, 21], fur)
      block(h, [-4, 4], [-2, 4], [20, 23], fur, 0.1)
      block(h, [-3, 3], [5, 9], [14, 18], light, 0.08)
      for (const x of [-1, 0]) for (const z of [16, 17]) put(h, x, 9, z, '#1B1A1E', 0.5)
      for (const x of [-2, -1, 0, 1]) put(h, x, 8, 15, '#3B2418', 0.5)
      eyes(p, 4, 19, 2, DARK, fur)
      // Each ear starts level with the eyes and hangs in a narrowing flap beside the cheek.
      for (const x of [5, 6, -6, -7])
        for (let z = 14; z <= 20; z++) {
          const down = (20 - z) / 6
          for (let y = Math.round(down * 2); y <= Math.round(3 - down * 1); y++)
            put(h, x, y, z, 'goldenEar', 0.66 - down * 0.08 + (rnd(x, y, z, 7) - 0.5) * 0.1)
        }
      lump(p.tongue, -0.5, 9, 13.6, 1.1, 1.5, 'pink', { fluff: 0, lift: 0.1 })
    },
    walk: {
      head: [3.5, -2.5],
      tailAt: [0, -10, 11],
      draw(p) {
        standing(p, 'goldenRich', 'goldenLight', {
          y0: -6.5,
          y1: -1,
          legH: 6,
          r: 4.8,
          rz: 4.2,
          legR: 1.6,
          w: 2.6,
          paw: 'goldenLight',
          coat: { fluff: 0.1 },
        })
        limb(
          p.tail,
          [
            [0, -10.5, 10],
            [0, -14, 9.4],
            [0, -17.5, 11],
          ],
          2,
          0.8,
          'goldenLight',
        )
        limb(
          p.tail,
          [
            [0, -10, 11],
            [0, -14, 11],
            [0, -17.5, 12.6],
          ],
          1.5,
          0.8,
          'goldenRich',
        )
      },
    },
  },
  shiba: {
    name: 'Shiba',
    tu: 0.88,
    tailAt: [0, -6, 8],
    tail: 'wag-small',
    headAt: [0, 1, 14],
    headMove: 'tilt',
    draw(p) {
      lump(p.tail, 0, -8.2, 8.8, 3.1, 3.1, 'shiba', { fluff: 0.06 }) // curled tail
      lump(p.tail, 0, -8.8, 9.6, 1.7, 1.7, 'cream', { fluff: 0 })
      sittingDog(p, 'shiba', 'cream', 'cream')
      for (const s of [-1, 1])
        lump(p.head, s * 3.3, 6, 16, 2.5, 2, 'cream', { fluff: 0.02, lift: 0.05 })
      lump(p.head, 0, 7, 16.4, 3, 2.4, 'cream', { fluff: 0, lift: 0.08 })
      for (const x of [-1, 0]) put(p.head, x, 10, 17, '#1B1A1E', 0.5)
      eyes(p, 7, 20, 2, DARK, 'shiba')
      earPair(p.ears, 2, 22, 5, 2, 3.6, 'shiba', 'cream')
    },
    walk: {
      head: [3, -2.5],
      tailAt: [0, -8, 12],
      draw(p) {
        standing(p, 'shiba', 'cream', {
          y0: -6,
          y1: -1,
          legH: 6,
          r: 4.2,
          rz: 3.8,
          legR: 1.4,
          w: 2.4,
          paw: 'cream',
        })
        lump(p.tail, 0, -9.5, 13.5, 3, 3, 'shiba', { fluff: 0.06 })
        lump(p.tail, 0, -10.2, 14.4, 1.7, 1.7, 'cream', { fluff: 0 })
      },
    },
  },
  // Each cat moves in its own way: the same rig, but a different tail rhythm and head movement.
  yellow: cat('Yellow cat', 'tail-cat', 'bob', {
    coat: 'ginger',
    stripe: [3, 'gingerStripe'],
    muzzle: 'cream',
    eye: '#3F8A3F',
    inner: 'pink',
  }),
  white: cat('White cat', 'tail-slow', 'tilt', {
    coat: 'whitecat',
    muzzle: 'whitecat',
    eye: '#3F7FC4',
    inner: 'pink',
  }),
  black: cat('Black cat', 'tail-twitch', 'bob', {
    coat: 'blackcat',
    muzzle: 'blackcat',
    eye: '#E9C22E',
    inner: 'blackcat',
  }),
  // The four big animals are drawn as babies: a head as large as the body, low eyes, and pink cheeks.
  buffalo: {
    name: 'Buffalo',
    tu: 1.35,
    tailAt: [0, -8, 4],
    tail: 'tail-slow',
    headAt: [0, 1, 10],
    headMove: 'bob',
    draw(p) {
      const b = p.body,
        h = p.head,
        soft = { fluff: 0.08 }
      limb(
        p.tail,
        [
          [0, -8, 4],
          [3, -10, 2],
          [5.5, -8.5, 1],
        ],
        0.8,
        0.75,
        'buffalo',
      )
      lump(p.tail, 6, -8, 1, 1.3, 1, 'buffaloDark', { fluff: 0.3 })
      lump(b, 0, -2.5, 4.6, 5.6, 4.8, 'buffalo', soft)
      for (const s of [-1, 1]) {
        lump(b, s * 4.4, 2.6, 1.4, 2.2, 1.5, 'buffalo', soft)
        lump(b, s * 4.4, 4.4, 1, 1.4, 1, 'buffaloDark', { fluff: 0 })
        limb(
          b,
          [
            [s * 2.3, 3.2, 1],
            [s * 2.3, 2.8, 8],
          ],
          1.7,
          1.6,
          'buffalo',
        )
        lump(b, s * 2.3, 3.6, 1, 1.7, 1, 'buffaloDark', { fluff: 0 })
      }
      lump(h, 0, 2, 15.5, 6.2, 5.4, 'buffalo', { fluff: 0.06, lift: 0.04 })
      lump(h, 0, 7.4, 13, 3.4, 2.6, 'buffaloMuzzle', { fluff: 0, lift: 0.06 })
      for (const x of [-2, 1]) put(h, x, 9, 13, '#4A4046', 0.5)
      lump(h, 0, 2, 21, 2.1, 1.3, 'buffaloDark', { fluff: 0.3 })
      // Wide crescent horns, the buffalo's signature.
      for (const s of [-1, 1])
        limb(
          h,
          [
            [s * 4, 1.5, 18.5],
            [s * 8.4, 1.5, 19],
            [s * 9.8, 1.5, 22.5],
            [s * 8, 1.5, 25],
          ],
          1.4,
          0.75,
          'horn',
          { lift: 0.08 },
        )
      eyes(p, 7, 17, 2, DARK, 'buffalo')
      blush(h, 4, 6, 15)
      for (const s of [-1, 1]) {
        const ear = s < 0 ? p.earsBack : p.ears
        lump(ear, s * 7.2, 1.5, 15, 2.1, 1.4, 'buffalo', { fluff: 0 })
        lump(ear, s * 7.5, 2.6, 15, 1.1, 0.8, 'pink', { fluff: 0 })
      }
    },
    walk: {
      head: [3.5, -2],
      tailAt: [0, -12, 9],
      draw(p) {
        standing(p, 'buffalo', 'buffalo', {
          y0: -6.5,
          y1: -0.5,
          legH: 4,
          r: 5.2,
          rz: 4.4,
          legR: 1.9,
          w: 2.9,
          paw: 'buffaloDark',
        })
        limb(
          p.tail,
          [
            [0, -12, 9],
            [0, -13.5, 4.5],
          ],
          0.8,
          0.75,
          'buffalo',
        )
        lump(p.tail, 0, -13.6, 3.4, 1.3, 1.2, 'buffaloDark', { fluff: 0.3 })
      },
    },
  },
  bear: {
    name: 'Bear',
    tu: 1.3,
    tailAt: [0, -7, 3],
    tail: 'wag-small',
    headAt: [0, 1, 10],
    headMove: 'bob',
    draw(p) {
      const b = p.body,
        h = p.head,
        soft = { fluff: 0.14 }
      lump(p.tail, 0, -8, 3, 1.7, 1.6, 'bear', { fluff: 0.1 })
      lump(b, 0, -2.5, 4.6, 5.6, 4.8, 'bear', soft)
      lump(b, 0, 1.8, 5, 3.6, 3.6, 'cream', { fluff: 0.1 })
      for (const s of [-1, 1]) {
        lump(b, s * 4.4, 2.6, 1.4, 2.2, 1.5, 'bear', soft)
        lump(b, s * 4.4, 4.3, 1.5, 1.2, 1, 'cream', { fluff: 0 })
        limb(
          b,
          [
            [s * 4.8, 0, 8.5],
            [s * 4.4, 3.2, 5],
          ],
          1.7,
          1.5,
          'bear',
        )
      }
      lump(h, 0, 1.5, 15, 6.4, 5.6, 'bear', { fluff: 0.06, lift: 0.04 })
      lump(h, 0, 7, 13.4, 2.8, 2.2, 'cream', { fluff: 0, lift: 0.08 })
      for (const x of [-1, 0]) put(h, x, 10, 14, '#2A1C18', 0.5)
      eyes(p, 7, 16, 2, DARK, 'bear')
      blush(h, 4, 6, 14)
      for (const s of [-1, 1]) {
        lump(p.ears, s * 4.8, 1, 20, 2.3, 2.3, 'bear', { fluff: 0 })
        lump(p.ears, s * 4.8, 2.3, 20, 1.2, 1.2, 'cream', { fluff: 0 })
      }
    },
    walk: {
      head: [4, -2],
      tailAt: [0, -11, 8],
      draw(p) {
        standing(p, 'bear', 'bear', {
          y0: -6,
          y1: -0.5,
          legH: 4,
          r: 5,
          rz: 4.4,
          legR: 1.9,
          w: 2.8,
          paw: 'bear',
          coat: { fluff: 0.14 },
        })
        lump(p.tail, 0, -11.4, 8.4, 1.7, 1.6, 'bear', { fluff: 0.1 })
      },
    },
  },
  monkey: {
    name: 'Monkey',
    tu: 1.15,
    tailAt: [1, -5, 2],
    tail: 'tail-cat',
    tailFront: true,
    headAt: [0, 1, 9],
    headMove: 'tilt',
    draw(p) {
      const b = p.body,
        h = p.head,
        soft = { fluff: 0.12 }
      limb(
        p.tail,
        [
          [1, -5, 2],
          [5, -7, 2.5],
          [7.5, -6, 6],
          [6, -5, 9.5],
          [4.4, -5, 8],
        ],
        1,
        0.8,
        'monkey',
      )
      lump(b, 0, -2, 4, 4, 4, 'monkey', soft)
      lump(b, 0, 1, 4.6, 2.8, 3.2, 'monkeyFace', { fluff: 0.06 })
      for (const s of [-1, 1]) {
        lump(b, s * 3.4, 2.6, 1, 1.6, 1.1, 'monkeyFace', { fluff: 0 })
        limb(
          b,
          [
            [s * 3.7, 0, 7.6],
            [s * 3.4, 3.2, 2.4],
          ],
          1.2,
          1.1,
          'monkey',
        )
        lump(b, s * 3.4, 3.8, 1.5, 1.2, 1, 'monkeyFace', { fluff: 0 })
      }
      lump(h, 0, 1, 13.5, 5.6, 5, 'monkey', { fluff: 0.08, lift: 0.04 })
      lump(h, 0, 4.2, 13.2, 4, 3.6, 'monkeyFace', { fluff: 0, lift: 0.05 })
      lump(h, 0, 6.4, 11.6, 2.4, 1.8, 'monkeyFace', { fluff: 0, lift: 0.08 })
      for (const x of [-1, 0]) put(h, x, 9, 12, '#5A3A2A', 0.5)
      eyes(p, 7, 14, 2, DARK, 'monkeyFace')
      blush(h, 3, 7, 12)
      for (const s of [-1, 1]) {
        const ear = s < 0 ? p.earsBack : p.ears
        lump(ear, s * 6.2, 1, 13.5, 2.3, 2.5, 'monkey', { fluff: 0 })
        lump(ear, s * 6.4, 2.2, 13.5, 1.3, 1.5, 'monkeyFace', { fluff: 0 })
      }
    },
    walk: {
      head: [3, -0.5],
      tailAt: [0, -8, 9],
      draw(p) {
        standing(p, 'monkey', 'monkey', {
          y0: -5,
          y1: -1,
          legH: 5,
          r: 3.4,
          rz: 3,
          legR: 1.1,
          w: 1.8,
          paw: 'monkeyFace',
          coat: { fluff: 0.12 },
        })
        limb(
          p.tail,
          [
            [0, -8, 9],
            [0, -12, 11],
            [0, -12.5, 15.5],
            [0, -10, 17],
            [0, -9, 15],
          ],
          1,
          0.8,
          'monkey',
        )
      },
    },
  },
  elephant: {
    name: 'Elephant',
    tu: 1.45,
    tailAt: [0, -8, 5],
    tail: 'tail-twitch',
    headAt: [0, 1, 10],
    headMove: 'tilt',
    earMove: 'fan',
    draw(p) {
      const b = p.body,
        h = p.head,
        soft = { fluff: 0.05 }
      limb(
        p.tail,
        [
          [0, -8, 5],
          [0, -10.5, 2.5],
        ],
        0.8,
        0.75,
        'elephant',
      )
      lump(p.tail, 0, -11, 1.6, 1.2, 1.1, 'elephantDark', { fluff: 0.2 })
      lump(b, 0, -2.5, 5, 5.8, 5, 'elephant', soft)
      for (const s of [-1, 1]) {
        lump(b, s * 4.2, 2.8, 1.5, 2.4, 1.6, 'elephant', soft)
        for (const x of [-1, 0, 1]) put(b, Math.round(s * 4.2 - 0.5) + x, 5, 0, 'cream', 0.6)
        limb(
          b,
          [
            [s * 2.6, 3.4, 0],
            [s * 2.6, 3, 7],
          ],
          1.8,
          1.7,
          'elephant',
        )
      }
      lump(h, 0, 1.5, 15, 6.2, 5.6, 'elephant', { fluff: 0.04, lift: 0.04 })
      limb(
        h,
        [
          [0, 6.5, 14],
          [0, 9.6, 11.5],
          [0, 10.2, 7.6],
          [0, 12, 6.4],
        ],
        1.75,
        1.2,
        'elephant',
        { band: 2, lift: 0.06 },
      )
      eyes(p, 7, 16, 3, DARK, 'elephant')
      blush(h, 4, 6, 13)
      for (const s of [-1, 1]) {
        const ear = s < 0 ? p.earsBack : p.ears
        for (const y of [-1, 0]) disc(ear, s * 8.6, y, 15.6, 4.2, 4.8, 'elephant')
        disc(ear, s * 8.8, 1, 15.4, 2.9, 3.5, 'pink')
      }
    },
    walk: {
      head: [4, -1],
      tailAt: [0, -11, 9],
      draw(p) {
        standing(p, 'elephant', 'elephant', {
          y0: -6,
          y1: -0.5,
          legH: 4,
          r: 5.4,
          rz: 4.6,
          legR: 2.1,
          w: 3,
          paw: 'elephant',
          coat: { fluff: 0.05 },
        })
        limb(
          p.tail,
          [
            [0, -11.4, 9],
            [0, -13, 5],
          ],
          0.8,
          0.75,
          'elephant',
        )
        lump(p.tail, 0, -13.2, 4, 1.2, 1.1, 'elephantDark', { fluff: 0.2 })
      },
    },
  },
}

const built = new Map<PetId, PetParts>()
// Parts are separate grids, so each can be drawn to its own image and moved around its own joint.
export function buildPet(id: PetId): PetParts {
  let parts = built.get(id)
  if (!parts) {
    parts = {
      tail: new Map(),
      body: new Map(),
      earsBack: new Map(),
      head: new Map(),
      ears: new Map(),
      lids: new Map(),
      tongue: new Map(),
    }
    PETS[id].draw(parts)
    built.set(id, parts)
  }
  return parts
}
export const partsOf = (id: PetId) => PART_NAMES.filter((k) => buildPet(id)[k].size > 0)

const builtWalk = new Map<PetId, WalkParts>()
export function buildWalk(id: PetId): WalkParts {
  let parts = builtWalk.get(id)
  if (!parts) {
    parts = { tail: new Map(), legsA: new Map(), legsB: new Map(), body: new Map() }
    PETS[id].walk.draw(parts)
    builtWalk.set(id, parts)
  }
  return parts
}

// Everything moves around its own joint, so tails wag from the base and heads turn from the neck.
export function petMarkup(id: PetId, i: number) {
  const pet = PETS[id],
    d = `animation-delay:${(-i * 0.83).toFixed(2)}s`,
    parts = partsOf(id)
  const at = ([x, y, z]: number[]) => [(x - y) * pet.tu, ((x + y) * pet.tu) / 2 - z * pet.tu]
  const layer = (k: PartName) => (parts.includes(k) ? `<use href="#pet-${id}-${k}"/>` : '')
  const moving = (inner: string, cls: string, pivot: number[]) => {
    if (!inner) return ''
    const [x, y] = at(pivot)
    return `<g transform="translate(${x} ${y})"><g class="life ${cls}" style="${d}"><g transform="translate(${-x} ${-y})">${inner}</g></g></g>`
  }
  const tail = moving(layer('tail'), pet.tail, pet.tailAt)
  const body = moving(layer('body'), 'breathe', [0, 0, 0])
  // An ear on the far side of a wide head has to be drawn before the head, or it would cover the face.
  const head =
    moving(layer('earsBack'), pet.earMove ?? 'flick', pet.headAt) +
    layer('head') +
    moving(layer('tongue'), 'tongue', [0, 10, 15]) +
    moving(layer('ears'), pet.earMove ?? 'flick', pet.headAt) +
    `<g class="life blink" style="${d}">${layer('lids')}</g>`
  const wholeHead = moving(head, pet.headMove, pet.headAt)
  const step = (k: string) => `<use href="#pet-${id}-walk-${k}"/>`
  const [hx, hy] = at([0, ...pet.walk.head])
  // Both poses are in the markup, and the garden's `.step` class shows the walking one.
  return (
    `<use href="#pet-${id}-base"/>` +
    `<g class="sit">${(pet.tailFront ? body + tail : tail + body) + wholeHead}</g>` +
    `<g class="walk">${moving(step('tail'), pet.tail, pet.walk.tailAt)}` +
    `<g class="life stride">${step('legsA')}</g><g class="life stride other">${step('legsB')}</g>` +
    `${step('body')}<g transform="translate(${hx} ${hy})">${wholeHead}</g></g>`
  )
}
