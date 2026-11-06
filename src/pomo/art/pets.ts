import { type Grid, type LumpOptions, limb, lump, put } from './cubes'

export const PET_IDS = ['corgi', 'golden', 'shiba', 'yellow', 'white', 'black'] as const
export type PetId = (typeof PET_IDS)[number]
const PART_NAMES = ['tail', 'body', 'head', 'ears', 'lids', 'tongue'] as const
export type PartName = (typeof PART_NAMES)[number]
export type PetParts = Record<PartName, Grid>
type Pet = {
  name: string
  tu: number
  tailAt: number[]
  tail: string
  tailFront?: boolean
  headAt: number[]
  headMove: string
  draw: (p: PetParts) => void
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
function sittingDog(parts: PetParts, coat: string, chest: string, muzzle: string) {
  const b = parts.body,
    h = parts.head,
    soft = { fluff: 0.12 }
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
  tu: 1.1,
  tailAt: [2.5, -4.5, 1],
  tail,
  tailFront: true,
  headAt: [0, 1, 10],
  headMove,
  draw: (p) => drawCat(p, look),
})
export const PETS: Record<PetId, Pet> = {
  corgi: {
    name: 'Corgi',
    tu: 1.1,
    tailAt: [0, -9, 8],
    tail: 'wag-fast',
    headAt: [0, 3, 10],
    headMove: 'bob',
    draw(p) {
      for (const [x, y] of [
        [-2.5, -7],
        [2.5, -7],
        [-2.5, 1],
        [2.5, 1],
      ])
        limb(
          p.body,
          [
            [x, y, 0],
            [x, y, 4],
          ],
          1.5,
          1.4,
          'cream',
          { lift: 0.08 },
        )
      lump(p.body, 0, -6, 7, 4.4, 3.8, 'corgi', { fluff: 0.1 })
      lump(p.body, 0, -1, 7.2, 4.4, 3.8, 'corgi', { fluff: 0.1 })
      lump(p.body, 0, 2.4, 6.4, 3.7, 3.9, 'cream', { fluff: 0.2 })
      lump(p.tail, 0, -11, 9, 1.7, 1.7, 'corgi', { fluff: 0 })
      lump(p.head, 0, 5, 13.5, 5.4, 4.8, 'corgi', { fluff: 0.06, lift: 0.04 })
      lump(p.head, 0, 9.5, 12, 2.8, 2.2, 'cream', { fluff: 0, lift: 0.08 })
      lump(p.head, 0, 9.6, 15.4, 1.2, 2.2, 'cream', { fluff: 0, lift: 0.1 }) // white blaze up the forehead
      for (const x of [-1, 0]) put(p.head, x, 12, 12, '#1B1A1E', 0.5)
      eyes(p, 9, 14, 2, DARK, 'corgi')
      earPair(p.ears, 4.4, 17, 7, 1.9, 3.6, 'corgi', 'pink')
    },
  },
  golden: {
    // Broad head, long muzzle, ears hanging past the jaw, a feathered neck and chest, and a long plume of a tail.
    name: 'Golden retriever',
    tu: 1.25,
    tailAt: [2, -6, 2],
    tail: 'wag',
    headAt: [0, 1, 14],
    headMove: 'pant',
    draw(p) {
      const b = p.body,
        h = p.head,
        fur = 'goldenRich',
        light = 'goldenLight',
        coat: LumpOptions = { fluff: 0.22, speck: ['goldenEar', 0.07] }
      limb(
        p.tail,
        [
          [2, -6, 2],
          [6, -8, 2.5],
          [11, -7, 4],
        ],
        1.6,
        1.1,
        fur,
      )
      lump(p.tail, 5, -8, 2, 2.6, 2, light, { fluff: 0.45 })
      lump(p.tail, 9, -7.6, 2.8, 2.4, 1.8, light, { fluff: 0.45 })
      lump(p.tail, 12, -6.8, 4.4, 1.6, 1.4, light, { fluff: 0.3 })
      lump(b, 0, -3.5, 4.2, 5.4, 4.4, fur, coat)
      for (const s of [-1, 1]) lump(b, s * 4, -0.5, 1.3, 2.2, 1.4, light, { fluff: 0.1 })
      lump(b, 0, -1, 10, 4.8, 7, fur, coat)
      for (const s of [-1, 1]) {
        limb(
          b,
          [
            [s * 2.2, 3.2, 0],
            [s * 2.2, 2.8, 8],
          ],
          1.7,
          1.5,
          fur,
          { lift: 0.06 },
        )
        lump(b, s * 2.6, 1.6, 4, 1.5, 3, light, { fluff: 0.45 })
        lump(b, s * 2.2, 4.4, 1, 2, 1.2, light, { fluff: 0.08 })
      }
      lump(b, 0, 1, 14, 5.2, 4, fur, { ...coat, fluff: 0.3 })
      lump(b, 0, 4.2, 11, 4.4, 4.6, light, { fluff: 0.42, lift: 0.06 })
      lump(b, 0, 5, 7.6, 3, 3.6, light, { fluff: 0.5, lift: 0.06 })
      lump(h, 0, 2, 19.4, 5.5, 4.5, fur, { fluff: 0.1, lift: 0.03 })
      lump(h, 0, 7.4, 17.4, 3.1, 2.3, light, { fluff: 0.02, lift: 0.02 })
      lump(h, 0, 9.2, 16.9, 2.3, 1.7, light, { fluff: 0.02 })
      for (const x of [-1, 0]) put(h, x, 11, 17, '#1B1A1E', 0.5)
      for (const x of [-2, -1, 0, 1]) put(h, x, 10, 15, '#3B2418', 0.5)
      eyes(p, 7, 20, 2, DARK, fur)
      for (const s of [-1, 1]) {
        lump(h, s * 5.4, 2.6, 20.5, 2.3, 1.6, 'goldenEar', { fluff: 0.18 })
        lump(h, s * 6.6, 3.4, 17.8, 2.5, 2.6, 'goldenEar', { fluff: 0.18 })
        lump(h, s * 6.6, 3.8, 15, 1.8, 2.2, 'goldenEar', { fluff: 0.18 })
      }
      lump(p.tongue, -0.5, 10, 13.4, 1.2, 1.7, 'pink', { fluff: 0, lift: 0.1 })
    },
  },
  shiba: {
    name: 'Shiba',
    tu: 1.1,
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
}

const built = new Map<PetId, PetParts>()
// Parts are separate grids, so each can be drawn to its own image and moved around its own joint.
export function buildPet(id: PetId): PetParts {
  let parts = built.get(id)
  if (!parts) {
    parts = {
      tail: new Map(),
      body: new Map(),
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
  const head =
    layer('head') +
    moving(layer('tongue'), 'tongue', [0, 10, 15]) +
    moving(layer('ears'), 'flick', pet.headAt) +
    `<g class="life blink" style="${d}">${layer('lids')}</g>`
  return (
    `<use href="#pet-${id}-base"/>` +
    (pet.tailFront ? body + tail : tail + body) +
    moving(head, pet.headMove, pet.headAt)
  )
}
