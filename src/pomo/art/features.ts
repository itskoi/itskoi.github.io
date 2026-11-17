import { rnd } from './cubes'
import { box, butterfly, koi, mix, n2, P, quad, small, vox } from './decor'

type Voxel = [number, number, number, string]

export const FEATURE_IDS = [
  'lantern',
  'lilypond',
  'hive',
  'zen',
  'bamboo',
  'bridge',
  'torii',
  'log',
  'bench',
  'birdbath',
  'veg',
  'tower',
] as const
export type FeatureId = (typeof FEATURE_IDS)[number]

const flat = (x: number, y: number, dx: number, dy: number, c: string, z = 0.02) =>
  quad([P(x, y, z), P(x + dx, y, z), P(x + dx, y + dy, z), P(x, y + dy, z)], c)
// Flat patches on the two faces a viewer sees: the one at a fixed y, and the one at a fixed x.
const wallL = (x: number, y: number, z: number, dx: number, dz: number, c: string) =>
  quad([P(x, y, z + dz), P(x + dx, y, z + dz), P(x + dx, y, z), P(x, y, z)], c)
const wallR = (x: number, y: number, z: number, dy: number, dz: number, c: string) =>
  quad([P(x, y, z + dz), P(x, y + dy, z + dz), P(x, y + dy, z), P(x, y, z)], c)
const at = (x: number, y: number, z: number, inner: string) => {
  const [sx, sy] = P(x, y, z)
  return `<g transform="translate(${n2(sx)} ${n2(sy)})">${inner}</g>`
}
const flower = (x: number, y: number, c: string, h = 0.8) =>
  box(x + 0.2, y + 0.2, 0, 0.16, 0.16, h, '#4F8F3F') + box(x, y, h, 0.55, 0.55, 0.2, c)
const byDepth = (items: [number, number, string][]) =>
  items
    .sort((a, b) => a[0] + a[1] - b[0] - b[1])
    .map((i) => i[2])
    .join('')

const STONE = ['#8F8D86', '#9B9992', '#A9A79F', '#B4B2AA', '#C2C0B8']
const GREEN = ['#4F8F3F', '#5C9A42', '#74AE52', '#8FBF5A']
const WOOD = '#8A6A45',
  BARK = '#7A5A3C',
  RED = '#C9442F',
  INK = '#2E2A26',
  WATER = '#5DB3D9',
  MOSS = '#7FAE5A'

function lantern() {
  const lit = '#F2D9A0',
    [gx, gy] = P(0.2, 0.2, 3.5)
  return (
    `<g class="night"><ellipse cx="0" cy="2" rx="22" ry="11" fill="url(#lamp-glow)"/></g>` +
    box(-2.9, -2.2, 0, 0.9, 0.9, 0.5, STONE[1]) +
    flower(-2.6, 0.6, '#FBFBF4') +
    box(-1.1, -1.1, 0, 2.2, 2.2, 0.4, STONE[0]) +
    flat(-1, -1, 0.8, 0.7, MOSS, 0.42) +
    box(-0.8, -0.8, 0.4, 1.6, 1.6, 0.3, STONE[2]) +
    box(-0.35, -0.35, 0.7, 0.7, 0.7, 1.9, STONE[2]) +
    box(-0.9, -0.9, 2.6, 1.8, 1.8, 0.35, STONE[3]) +
    box(-0.6, -0.6, 2.95, 1.2, 1.2, 1.1, STONE[2]) +
    wallL(-0.35, 0.6, 3.15, 0.7, 0.7, lit) +
    wallR(0.6, -0.35, 3.15, 0.7, 0.7, mix(lit, -0.12)) +
    box(-1.3, -1.3, 4.05, 2.6, 2.6, 0.3, STONE[0]) +
    box(-0.9, -0.9, 4.35, 1.8, 1.8, 0.3, STONE[2]) +
    box(-0.4, -0.4, 4.65, 0.8, 0.8, 0.3, STONE[3]) +
    box(-0.15, -0.15, 4.95, 0.3, 0.3, 0.4, STONE[0]) +
    box(1.6, 1.8, 0, 0.8, 0.8, 0.4, STONE[2]) +
    flower(2.2, 0.2, '#F29FB6') +
    `<g class="night"><circle class="life pulse" cx="${n2(gx)}" cy="${n2(gy)}" r="20" fill="url(#lamp-glow)"/></g>`
  )
}

// Drawn over the pond's own ground: bigger pads, lotus, and a frog.
function lilypond() {
  const pad = (x: number, y: number, s: number) =>
    flat(x, y, s, s, '#3F8A48', 0.13) +
    flat(x + s * 0.12, y + s * 0.12, s * 0.5, s * 0.5, '#58A65A', 0.14) +
    flat(x + s * 0.7, y + s * 0.7, s * 0.3, s * 0.3, WATER, 0.15)
  const lotus = (x: number, y: number) =>
    box(x, y, 0.14, 0.9, 0.9, 0.22, '#F29FB6') +
    box(x + 0.16, y + 0.16, 0.36, 0.58, 0.58, 0.28, '#F7BFD0') +
    box(x + 0.3, y + 0.3, 0.64, 0.3, 0.3, 0.2, '#FDF3C4')
  const g = '#5FAE3C',
    frog: Voxel[] = []
  for (let x = 0; x < 3; x++) for (let y = 0; y < 2; y++) frog.push([x, y, 0, x ? g : '#4F9A34'])
  frog.push(
    [2, 0, 1, g],
    [2, 1, 1, g],
    [1, 0, 1, g],
    [1, 1, 1, g],
    [2, 0, 2, '#F4F1E0'],
    [2, 1, 2, '#F4F1E0'],
    [-1, -1, 0, '#4F9A34'],
    [-1, 2, 0, '#4F9A34'],
  )
  return (
    koi() +
    pad(0.4, -1.9, 1.3) +
    lotus(0.6, -1.7) +
    pad(-1, 0, 1.7) +
    `<g class="life bob">${small(frog, -0.6, 0.45, 0.15)}</g>` +
    pad(0.9, 0.3, 1) +
    lotus(-2.2, 1.2)
  )
}

const BEE: Voxel[] = []
for (let x = -2; x < 3; x++)
  for (let z = 0; z < 2; z++) BEE.push([x, 0, z, x === 2 || x % 2 ? '#2B2420' : '#F2C12E'])
const bee = (x: number, y: number, z: number, i: number) =>
  at(
    x,
    y,
    z,
    `<g transform="scale(.5)"><g class="life w${(i % 3) + 1}" style="animation-delay:${-i * 3.1}s"><g transform="scale(.44)">${vox(BEE)}</g><g transform="translate(0 -3.6) scale(1.2)"><g class="flap"><path d="M0 0L-3 -2L-2.4 .6Z" fill="#DDF0FA"/></g><g class="flap"><path d="M0 0L3 -2L2.4 .6Z" fill="#DDF0FA"/></g></g></g></g>`,
  )

function hive() {
  let s =
    flower(-3, -2.4, '#F6D84E') +
    flower(-2.6, 1.4, '#B58BE0') +
    box(-1.3, -1.3, 0, 2.6, 2.6, 1.3, BARK) +
    wallL(-0.8, 1.3, 0, 0.2, 1.3, mix(BARK, -0.25)) +
    wallL(0.5, 1.3, 0, 0.2, 1.3, mix(BARK, -0.25)) +
    wallR(1.3, -0.4, 0, 0.2, 1.3, mix(BARK, -0.4)) +
    flat(-1.1, -1.1, 2.2, 2.2, '#C9A877', 1.32) +
    flat(-0.7, -0.7, 1.4, 1.4, '#B8935F', 1.33) +
    box(1.3, 0.4, 0, 0.7, 0.6, 0.4, BARK)
  let z = 1.3
  ;(
    [
      [1.7, 0.45, '#E0A81F'],
      [2, 0.45, '#F2C12E'],
      [2, 0.45, '#E0A81F'],
      [1.7, 0.45, '#F2C12E'],
      [1.2, 0.4, '#E0A81F'],
      [0.6, 0.3, '#C98F1A'],
    ] as [number, number, string][]
  ).forEach(([w, h, c], i) => {
    s += box(-w / 2, -w / 2, z, w, w, h, c)
    if (i === 1) s += wallL(-0.3, 1, z + 0.02, 0.6, 0.4, '#3A2A14')
    z += h
  })
  return (
    s +
    flower(2, 2, '#FBFBF4') +
    flower(0.2, 2.6, '#F29FB6') +
    bee(-2.2, 1, 2.6, 0) +
    bee(1.6, -1.6, 3.8, 1) +
    bee(1, 2.2, 1.6, 2)
  )
}

function zen() {
  const sand = '#E9DFC3',
    line = '#CFC29D'
  let s =
    box(-3.5, -3.5, 0, 7, 0.3, 0.3, WOOD) +
    box(-3.5, -3.5, 0, 0.3, 7, 0.3, WOOD) +
    flat(-3.2, -3.2, 6.4, 6.4, sand, 0.06)
  for (let i = 0; i < 11; i++) s += flat(-3, -2.9 + i * 0.57, 6, 0.14, line, 0.07)
  const ring = (x: number, y: number, w: number) => {
    let r = flat(x - 0.9, y - 0.9, w + 1.8, w + 1.8, sand, 0.08)
    for (const o of [0.35, 0.75])
      r +=
        flat(x - o, y - o, w + 2 * o, 0.12, line, 0.09) +
        flat(x - o, y - o, 0.12, w + 2 * o, line, 0.09) +
        flat(x - o, y + w + o - 0.12, w + 2 * o, 0.12, line, 0.09) +
        flat(x + w + o - 0.12, y - o, 0.12, w + 2 * o, line, 0.09)
    return r
  }
  return (
    s +
    ring(-1.8, -1.6, 1.4) +
    ring(1.2, 1, 0.9) +
    box(-1.8, -1.6, 0, 1.4, 1.4, 1.1, STONE[1]) +
    flat(-1.7, -1.5, 0.7, 0.6, MOSS, 1.12) +
    box(-1.5, -1.3, 1.1, 0.8, 0.8, 0.5, STONE[3]) +
    box(1.2, 1, 0, 0.9, 0.9, 0.55, STONE[0]) +
    box(-3.5, 3.2, 0, 7, 0.3, 0.3, WOOD) +
    box(3.2, -3.5, 0, 0.3, 7, 0.3, WOOD)
  )
}

// A shishi-odoshi: water drips into a bamboo tube, which tips into the basin and swings back.
function bamboo() {
  const culm = (x: number, y: number, h: number): [number, number, string] => {
    let s = box(x, y, 0, 0.32, 0.32, h, '#78AE45')
    for (let z = 1; z < h; z += 1.1) s += box(x - 0.04, y - 0.04, z, 0.4, 0.4, 0.1, '#55913A')
    s +=
      box(x + 0.3, y + 0.08, h - 0.6, 0.8, 0.14, 0.14, '#4F9C41') +
      box(x + 0.08, y + 0.3, h - 1.1, 0.14, 0.8, 0.14, '#7FBF4E') +
      box(x - 0.7, y + 0.08, h - 0.3, 0.7, 0.14, 0.14, '#4F9C41')
    return [x, y, s]
  }
  const pole = '#9FC95A'
  return (
    byDepth([
      culm(-2.8, -2.6, 6),
      culm(-1.8, -3, 5.2),
      culm(-3.1, -1.4, 4.6),
      culm(-1.3, -2.1, 5.6),
      culm(-2.3, -0.7, 3.8),
    ]) +
    box(0.8, -0.5, 0, 0.3, 0.3, 2.9, pole) +
    box(0.85, -0.2, 2.6, 0.2, 1.5, 0.2, '#B9D97A') +
    box(-1, 0.8, 0, 0.22, 0.22, 1.8, WOOD) +
    box(0.5, 0.7, 0, 2.2, 2.2, 0.7, STONE[1]) +
    flat(0.8, 1, 1.6, 1.6, WATER, 0.72) +
    flat(1, 1.2, 0.5, 0.5, '#8FD0EA', 0.73) +
    at(
      -0.9,
      1.2,
      1.5,
      `<g class="life tip"><line x1="-5.2" y1="-1.4" x2="7.2" y2="1.6" stroke="#6E9A3C" stroke-width="2.6" stroke-linecap="round"/><line x1="-5.2" y1="-1.8" x2="7.2" y2="1.2" stroke="${pole}" stroke-width="1.6" stroke-linecap="round"/></g>`,
    ) +
    box(-1, 1.5, 0, 0.22, 0.22, 1.8, WOOD) +
    at(
      0.95,
      1.2,
      2.6,
      `<rect class="life drip" x="-.4" y="0" width=".8" height="1.8" rx=".4" fill="#8FD0EA"/>`,
    ) +
    box(2.9, -1.4, 0, 0.7, 0.7, 0.4, STONE[2])
  )
}

function bridge() {
  const hs = [0.5, 1, 1.3, 1.3, 1, 0.5]
  const rail = (y: number) =>
    hs
      .map((h, i) => {
        const x = -3 + i
        return (
          box(x, y, h, 0.2, 0.2, 0.9, RED) +
          box(x, y, h + 0.65, 1, 0.2, 0.2, RED) +
          (i === 5 ? box(x + 0.8, y, h, 0.2, 0.2, 0.9, RED) : '')
        )
      })
      .join('')
  let s =
    flat(-1.6, -3.8, 3.2, 7.6, '#6C5A45', 0.03) +
    flat(-1.3, -3.8, 2.6, 7.6, WATER, 0.05) +
    flat(-0.9, -3, 0.5, 1.6, '#8FD0EA', 0.06) +
    flat(0.3, 1.6, 0.4, 1.4, '#8FD0EA', 0.06) +
    box(-2, -3.6, 0, 0.7, 0.7, 0.4, STONE[2]) +
    box(1.4, -3.2, 0, 0.7, 0.7, 0.45, STONE[1]) +
    rail(-1)
  hs.forEach((h, i) => {
    const ends = i === 0 || i === 5
    s += box(-3 + i, -1, ends ? 0 : h - 0.35, 1, 2, ends ? h : 0.35, '#B5713A')
  })
  return (
    s +
    rail(0.8) +
    box(-2.1, 2.9, 0, 0.7, 0.7, 0.4, STONE[3]) +
    box(1.5, 3, 0, 0.7, 0.7, 0.45, STONE[2]) +
    flower(-3.2, 2.2, '#F6D84E')
  )
}

function torii() {
  let s = ''
  for (let i = 0; i < 6; i++)
    s += box(-0.5 + (i % 2) * 0.15, -3.6 + i * 1.25, 0, 0.95, 0.9, 0.1, STONE[2 + (i % 3)])
  const pillar = (x: number) =>
    box(x - 0.1, -0.4, 0, 0.8, 0.8, 0.5, INK) + box(x, -0.3, 0.5, 0.6, 0.6, 4.1, RED)
  return (
    s +
    pillar(-2.3) +
    pillar(1.7) +
    box(-2.9, -0.2, 3.3, 5.8, 0.4, 0.45, RED) +
    box(-0.25, -0.2, 3.75, 0.5, 0.4, 0.85, RED) +
    box(-3.4, -0.35, 4.6, 6.8, 0.7, 0.5, '#D9553F') +
    box(-3.6, -0.4, 5.1, 7.2, 0.8, 0.25, INK) +
    flower(-3.2, 1.8, '#FBFBF4') +
    flower(2.6, 2, '#F29FB6')
  )
}

function log() {
  const shroom = (x: number, y: number, z: number, s: number, cap: string) =>
    box(x + 0.2 * s, y + 0.2 * s, z, 0.3 * s, 0.3 * s, 0.5 * s, '#F3EBD8') +
    box(x, y, z + 0.5 * s, 0.7 * s, 0.7 * s, 0.35 * s, cap) +
    flat(x + 0.1 * s, y + 0.1 * s, 0.18 * s, 0.18 * s, '#FBFBF4', z + 0.86 * s) +
    flat(x + 0.42 * s, y + 0.36 * s, 0.16 * s, 0.16 * s, '#FBFBF4', z + 0.86 * s)
  const fern = (x: number, y: number) =>
    [0, 1, 2, 3]
      .map((k) =>
        box(x + k * 0.25, y + (k % 2) * 0.25, 0, 0.16, 0.16, 0.7 + (k % 3) * 0.4, GREEN[1]),
      )
      .join('')
  return (
    fern(-2.6, -2.4) +
    fern(1, -2.2) +
    box(-0.9, -1.1, 0.3, 0.5, 0.7, 0.5, BARK) +
    box(-2.8, -0.4, 0, 5.4, 1.5, 1.3, BARK) +
    wallR(2.6, -0.25, 0.15, 1.2, 1, '#C9A877') +
    wallR(2.6, 0.1, 0.4, 0.5, 0.5, '#B8935F') +
    wallL(-1.6, 1.1, 0, 0.2, 1.3, mix(BARK, -0.25)) +
    wallL(0.4, 1.1, 0, 0.2, 1.3, mix(BARK, -0.25)) +
    flat(-2.6, -0.3, 1.7, 1.1, MOSS, 1.32) +
    flat(0.3, 0.2, 1.3, 0.8, '#6FA24E', 1.32) +
    shroom(-0.7, 0.1, 1.3, 1, RED) +
    shroom(1.5, -0.2, 1.3, 0.7, RED) +
    shroom(-2.2, 1.7, 0, 1.2, RED) +
    shroom(-1.1, 2.4, 0, 0.8, '#B5713A') +
    shroom(1.4, 1.8, 0, 0.9, '#B5713A') +
    shroom(2.2, 2.4, 0, 0.6, RED)
  )
}

function bench() {
  const dark = '#6B4A2D',
    seat = '#B08A5A'
  const path = [
    [-3.6, 1.2],
    [-2.5, 1.7],
    [-1.3, 1.5],
    [-0.2, 2],
    [1, 1.8],
    [2.1, 2.3],
    [3, 1.6],
  ]
    .map(([x, y], i) => box(x, y, 0, 0.9, 0.85, 0.1, STONE[2 + (i % 3)]))
    .join('')
  return (
    box(-1.7, -1.6, 0, 0.3, 0.9, 0.8, dark) +
    box(1.4, -1.6, 0, 0.3, 0.9, 0.8, dark) +
    box(-1.7, -1.6, 0.8, 0.3, 0.25, 1.3, dark) +
    box(1.4, -1.6, 0.8, 0.3, 0.25, 1.3, dark) +
    box(-1.7, -1.6, 1.3, 3.4, 0.2, 0.3, seat) +
    box(-1.7, -1.6, 1.75, 3.4, 0.2, 0.3, seat) +
    box(-1.8, -1.5, 0.8, 3.6, 1, 0.2, seat) +
    flower(-3, -1.8, '#F6D84E') +
    flower(2.6, -0.6, '#B58BE0') +
    path
  )
}

function birdbath() {
  const b = '#4F8FD0',
    bird: Voxel[] = [
      [0, 0, 0, b],
      [1, 0, 0, b],
      [2, 0, 0, '#F4F1E0'],
      [0, 0, 1, b],
      [1, 0, 1, b],
      [2, 0, 1, b],
      [2, 0, 2, b],
      [3, 0, 2, '#E58A33'],
      [-1, 0, 1, '#3A6FA8'],
    ]
  return (
    flower(-2.8, -2, '#F29FB6') +
    flower(-2.6, 1.6, '#FBFBF4') +
    box(-0.9, -0.9, 0, 1.8, 1.8, 0.35, STONE[1]) +
    box(-0.35, -0.35, 0.35, 0.7, 0.7, 1.7, STONE[2]) +
    box(-0.6, -0.6, 2.05, 1.2, 1.2, 0.25, STONE[3]) +
    box(-1.4, -1.4, 2.3, 2.8, 2.8, 0.5, STONE[3]) +
    flat(-1.1, -1.1, 2.2, 2.2, WATER, 2.82) +
    flat(-0.8, -0.9, 0.6, 0.6, '#8FD0EA', 2.83) +
    `<g class="life bob">${small(bird, 0.5, 0.9, 2.8)}</g>` +
    flower(2, 2.2, '#F6D84E')
  )
}

function veg() {
  const row = (y: number, items: string) =>
    box(-3, y, 0, 6, 1.2, 0.3, BARK) + flat(-2.9, y + 0.1, 5.8, 1, '#6B4A2D', 0.32) + items
  const cabbage = (x: number, y: number) =>
    box(x, y, 0.3, 0.85, 0.85, 0.5, '#7FBF4E') +
    box(x + 0.2, y + 0.2, 0.8, 0.45, 0.45, 0.2, '#C2E274')
  const carrot = (x: number, y: number) =>
    box(x + 0.15, y + 0.15, 0.3, 0.3, 0.3, 0.15, '#F28A3C') +
    [0, 1, 2]
      .map((k) =>
        box(
          x + k * 0.2,
          y + (k % 2) * 0.25 + 0.1,
          0.45,
          0.14,
          0.14,
          0.6 + (k % 2) * 0.3,
          '#4F9C41',
        ),
      )
      .join('')
  const pumpkin = (x: number, y: number, s: number) =>
    box(x, y, 0.3, s, s, s * 0.7, '#F28A3C') +
    wallL(x + s * 0.3, y + s, 0.3, 0.08, s * 0.7, '#C4501F') +
    wallL(x + s * 0.65, y + s, 0.3, 0.08, s * 0.7, '#C4501F') +
    box(x + s * 0.4, y + s * 0.4, 0.3 + s * 0.7, 0.2, 0.2, 0.25, GREEN[0])
  return (
    row(-2.9, [-2.7, -1.4, -0.1, 1.2, 2.1].map((x) => cabbage(x, -2.75)).join('')) +
    row(-0.8, [-2.8, -1.9, -1, -0.1, 0.8, 1.7].map((x) => carrot(x, -0.6)).join('')) +
    row(1.3, pumpkin(-2.6, 1.4, 1) + pumpkin(-0.9, 1.5, 0.8) + pumpkin(0.9, 1.4, 1.05)) +
    box(2.5, 2.9, 0, 0.16, 0.16, 1.2, WOOD) +
    box(2.1, 2.85, 0.8, 0.9, 0.12, 0.5, '#C9A877')
  )
}

const BLOCK = 1.4 // A tower block and the gap under it, in cubes.
const roofOf = (floors: number) => 0.35 + floors * BLOCK
// How far above its plot the tower reaches, searchlights included, in screen units.
export const towerHeight = (floors: number) => (roofOf(floors) + 0.3) * 4 + 40

// A brutalist tower: raw concrete blocks stacked off-centre around a service core, overgrown, flag on top.
function tower(floors: number) {
  const con = '#B9B5AC',
    dark = '#8E8A82',
    glass = '#33424D',
    w = 2.3,
    h = 1.2,
    top = roofOf(floors),
    OFF = [
      [0, 0],
      [0.4, -0.25],
      [-0.25, 0.35],
    ]
  let s =
    flower(-3.3, -1.6, '#FBFBF4') +
    box(-1.9, -1.9, 0, 3.8, 3.8, 0.35, dark) +
    flat(-1.8, 1, 1.2, 0.8, GREEN[2], 0.37) +
    flat(1, -1.8, 0.8, 1.4, GREEN[1], 0.37) +
    box(-1.75, -1.75, 0.35, 0.9, 0.9, top + 0.5, con) +
    wallL(-1.45, -0.85, 0.6, 0.12, top, dark) +
    wallR(-0.85, -1.45, 0.6, 0.12, top, mix(dark, -0.2)) +
    wallL(-1.75, -0.85, top - 0.6, 0.3, 1.3, GREEN[1]) +
    wallL(-1.2, -0.85, top + 0.1, 0.3, 0.75, GREEN[2]) +
    wallR(-0.85, -1.7, top - 0.2, 0.35, 1, GREEN[0])
  for (let i = 0; i < floors; i++) {
    const [ox, oy] = OFF[i % 3],
      x = -w / 2 + 0.15 + ox,
      y = -w / 2 + 0.15 + oy,
      z = 0.35 + i * BLOCK,
      roof = z + 0.2 + h
    s +=
      box(x + 0.3, y + 0.3, z, w - 0.6, w - 0.6, 0.2, mix(dark, -0.35)) +
      box(x, y, z + 0.2, w, w, h, con) +
      wallL(x + 0.15, y + w, z + 0.6, w - 0.3, 0.42, glass)
    for (let k = 1; k < 5; k++)
      s += wallL(x + 0.15 + k * 0.4 - 0.03, y + w, z + 0.6, 0.06, 0.42, con)
    if (i % 2) s += wallL(x + 0.58, y + w, z + 0.6, 0.34, 0.42, '#FFD873')
    for (let k = 0; k < 3; k++)
      s += wallR(
        x + w,
        y + 0.25 + k * 0.68,
        z + 0.55,
        0.42,
        0.5,
        k === i % 3 ? '#E0A840' : mix(glass, -0.15),
      )
    // Lights come on and go off window by window, and a glint of sun crosses the glass.
    for (let k = 0; k < 5; k++)
      if (rnd(i, k, 95) < 0.6)
        s += `<g class="life lamp" style="animation-duration:${n2(7 + rnd(i, k, 96) * 6)}s;animation-delay:${n2(-rnd(i, k, 97) * 12)}s">${wallL(x + 0.18 + k * 0.4, y + w, z + 0.6, 0.34, 0.42, '#FFD873')}</g>`
    for (let k = 0; k < 3; k++)
      if (rnd(i, k, 98) < 0.6)
        s += `<g class="life lamp" style="animation-duration:${n2(8 + rnd(i, k, 99) * 6)}s;animation-delay:${n2(-rnd(i, k, 100) * 12)}s">${wallR(x + w, y + 0.25 + k * 0.68, z + 0.55, 0.42, 0.5, '#E0A840')}</g>`
    s += `<g class="life sweep" style="--gx:${n2((w - 0.5) * 4)}px;--gy:${n2((w - 0.5) * 2)}px;animation-delay:${n2(i * 0.35)}s">${wallL(x + 0.15, y + w, z + 0.6, 0.2, 0.42, '#FFFFFF')}</g>`
    // Vines hang from each roof edge, down both faces.
    for (let k = 0; k < 4; k++) {
      const len = 0.2 + rnd(i, k, 91) * 0.45
      s += wallL(
        x + 0.05 + k * 0.6 + rnd(i, k, 92) * 0.2,
        y + w,
        roof - len,
        0.22,
        len,
        GREEN[(i + k) % 4],
      )
    }
    for (let k = 0; k < 3; k++) {
      const len = 0.2 + rnd(i, k, 93) * 0.4
      s += wallR(
        x + w,
        y + 0.1 + k * 0.8 + rnd(i, k, 94) * 0.2,
        roof - len,
        0.24,
        len,
        mix(GREEN[(i + k + 1) % 4], -0.12),
      )
    }
    // The roof of each block is planted; the next block covers most of it and leaves a green ledge.
    s +=
      flat(x + 0.1, y + 0.1, w - 0.2, w - 0.2, GREEN[2], roof + 0.01) +
      box(x + 0.1, y + w - 0.55, roof, 0.7, 0.45, 0.4, GREEN[1]) +
      box(x + w - 0.6, y + 0.15, roof, 0.5, 0.6, 0.35, GREEN[0]) +
      box(x + w - 0.6, y + w - 0.6, roof, 0.5, 0.5, 0.5, GREEN[3])
  }
  const [ox, oy] = OFF[(floors - 1) % 3],
    rx = -w / 2 + 0.15 + ox,
    ry = -w / 2 + 0.15 + oy,
    pole = top + 0.85,
    [fx, fy] = P(-0.53, -1.3, pole + 1.55)
  const star = Array.from({ length: 10 }, (_, k) => {
    const r = k % 2 ? 0.1 : 0.26,
      a = (k * Math.PI) / 5
    return `${+(Math.sin(a) * r).toFixed(3)} ${+(Math.cos(a) * r).toFixed(3)}`
  }).join('L')
  // Two searchlights sweep the sky from the roof; two lamps on the podium wash the lower walls.
  const beam = (x: number, y: number, lean: number, secs: number, delay: number) =>
    at(
      x,
      y,
      top + 0.3,
      `<g transform="rotate(${lean})"><path class="life beam" style="animation-duration:${secs}s;animation-delay:${delay}s" d="M-.5 0L-5 -36L5 -36L.5 0Z" fill="url(#tower-beam)"/></g>`,
    ) + box(x - 0.15, y - 0.15, top, 0.3, 0.3, 0.3, INK)
  const wash = (x: number, y: number) => {
    const [wx, wy] = P(x, y, 1.5)
    return `<circle class="life pulse" cx="${n2(wx)}" cy="${n2(wy)}" r="9" fill="url(#tower-wash)"/>`
  }
  return (
    s +
    box(-1.75, 1.5, 0.35, 0.3, 0.3, 0.2, INK) +
    box(1.5, -1.75, 0.35, 0.3, 0.3, 0.2, INK) +
    wash(-0.6, 1.4) +
    wash(1.4, -0.6) +
    beam(rx + 0.35, ry + 1.75, -16, 7, 0) +
    beam(rx + 1.95, ry + 0.35, 18, 9, -3) +
    box(rx + 0.9, ry + 0.5, top, 0.25, 0.25, 0.7, BARK) +
    box(rx + 0.6, ry + 0.2, top + 0.7, 0.85, 0.85, 0.7, GREEN[1]) +
    box(rx + 0.8, ry + 0.4, top + 1.4, 0.45, 0.45, 0.3, GREEN[3]) +
    box(-1.36, -1.36, pole, 0.12, 0.12, 2, '#55514B') +
    `<g class="life wave">${wallL(-1.24, -1.3, pole + 1.1, 1.3, 0.9, '#DA251D')}<path transform="matrix(4 2 0 -4 ${n2(fx)} ${n2(fy)})" d="M${star}Z" fill="#FFDD00"/></g>` +
    butterfly(-15, -top * 2.2, 0, 0.5) +
    butterfly(14, -top * 1.4 - 6, 2, 0.5) +
    box(2, 2.2, 0, 0.9, 0.5, 0.35, con) +
    box(2.1, 2.3, 0.35, 0.7, 0.3, 0.3, GREEN[1]) +
    flower(2.8, 0.6, '#F6D84E')
  )
}

const ART: Record<Exclude<FeatureId, 'tower'>, () => string> = {
  lantern,
  lilypond,
  hive,
  zen,
  bamboo,
  bridge,
  torii,
  log,
  bench,
  birdbath,
  veg,
}
const drawn = new Map<string, string>()
// The same string every time, so the garden never rewrites a feature and restarts its animations.
export function feature(id: FeatureId, floors: number) {
  const key = id === 'tower' ? `tower-${floors}` : id
  let s = drawn.get(key)
  if (!s) {
    s = `<g data-feature="${id}">${id === 'tower' ? tower(floors) : ART[id]()}</g>`
    drawn.set(key, s)
  }
  return s
}

// Shown only under the Night sky.
export function fireflies(x: number, y: number, seed: number) {
  let s = ''
  for (let i = 0; i < 5; i++) {
    const fx = x + (rnd(seed, i, 111) - 0.5) * 48,
      fy = y - 6 - rnd(seed, i, 112) * 22
    s += `<g class="night firefly" transform="translate(${n2(fx)} ${n2(fy)})"><g class="life w${(i % 3) + 1}" style="animation-delay:${n2(-rnd(seed, i, 113) * 12)}s"><g class="pulse" style="animation-delay:${n2(-rnd(seed, i, 114) * 2)}s"><circle r="3.4" fill="url(#firefly-glow)"/><circle r=".7" fill="#FBFFC8"/></g></g></g>`
  }
  return s
}

const DRAGONFLY = ['#2F8FC4', '#D9532F', '#3FA66B']
export function dragonfly(x: number, y: number, i: number) {
  const c = DRAGONFLY[i % DRAGONFLY.length]
  const wing = (d: number, back: number) =>
    `<g class="flap" style="animation-delay:${i * 60 + back * 40}ms"><path d="M0 ${back}L${d * 5} ${back - 2.4}L${d * 5.4} ${n2(back - 0.6)}Z" fill="#DDF0FA" opacity=".85"/></g>`
  return `<g class="dragonfly" transform="translate(${n2(x)} ${n2(y)})"><g class="life w${(i % 3) + 1}" style="animation-delay:${-i * 4}s">${wing(-1, 0)}${wing(1, 0)}${wing(-1, 1.4)}${wing(1, 1.4)}<rect x="-.6" y="-1.4" width="1.2" height="7" rx=".6" fill="${c}"/><circle cy="-1.6" r="1.1" fill="${mix(c, -0.3)}"/></g></g>`
}
