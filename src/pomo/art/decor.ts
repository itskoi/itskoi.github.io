import { PAL, rnd } from './cubes'

type Voxel = [number, number, number, string]

// A plot is 8 x 8 cubes, and each cube is 4 units on the screen.
const U = 4
const P = (a: number, b: number, c: number): [number, number] => [
  (a - b) * U,
  ((a + b) * U) / 2 - c * U,
]
const n2 = (v: number) => +v.toFixed(1)
const quad = (ps: number[][], fill: string, extra = '') =>
  `<path d="M${ps.map(([x, y]) => `${n2(x)} ${n2(y)}`).join('L')}Z" fill="${fill}" stroke="${fill}" stroke-width=".3"${extra}/>`
const mix = (hex: string, t: number) => {
  const n = parseInt(hex.slice(1), 16),
    to = t < 0 ? 0 : 255,
    a = Math.abs(t)
  const f = (s: number) =>
    Math.round(((n >> s) & 255) * (1 - a) + to * a)
      .toString(16)
      .padStart(2, '0')
  return `#${f(16)}${f(8)}${f(0)}`
}
const TOP = 1,
  LEFT = 2,
  RIGHT = 4
function box(
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number,
  c: string,
  faces = 7,
) {
  let s = ''
  if (faces & LEFT)
    s += quad(
      [P(x, y + dy, z + dz), P(x + dx, y + dy, z + dz), P(x + dx, y + dy, z), P(x, y + dy, z)],
      c,
    )
  if (faces & RIGHT)
    s += quad(
      [P(x + dx, y, z + dz), P(x + dx, y + dy, z + dz), P(x + dx, y + dy, z), P(x + dx, y, z)],
      mix(c, -0.2),
    )
  if (faces & TOP)
    s += quad(
      [P(x, y, z + dz), P(x + dx, y, z + dz), P(x + dx, y + dy, z + dz), P(x, y + dy, z + dz)],
      mix(c, 0.14),
    )
  return s
}
// Draws cubes back to front and leaves out faces another cube hides.
export function vox(list: Voxel[]) {
  const at = new Set(list.map(([x, y, z]) => `${x},${y},${z}`))
  return [...list]
    .sort((a, b) => a[0] + a[1] + a[2] - b[0] - b[1] - b[2])
    .map(([x, y, z, c]) => {
      const f =
        (at.has(`${x},${y},${z + 1}`) ? 0 : TOP) |
        (at.has(`${x},${y + 1},${z}`) ? 0 : LEFT) |
        (at.has(`${x + 1},${y},${z}`) ? 0 : RIGHT)
      return f ? box(x, y, z, 1, 1, 1, c, f) : ''
    })
    .join('')
}
const decal = (x: number, y: number, s: number, c: string, z = 0.02, o = '') =>
  quad([P(x, y, z), P(x + s, y, z), P(x + s, y + s, z), P(x, y + s, z)], c, o)
const GRASS = '#8FC766'
export function plot(v: number) {
  let s = ''
  for (let i = 0; i < 8; i++) {
    for (const [fx, fy, face] of [
      [-4 + i, 3, LEFT],
      [3, -4 + i, RIGHT],
    ]) {
      const lip = 1 + rnd(i, v, face) * 0.6,
        dirt = 2.6 + rnd(i, v, face, 1),
        rock = dirt + 0.7 + rnd(i, v, face, 2) * 0.9
      s +=
        box(fx, fy, -rock, 1, 1, rock - dirt, '#6D6A64', face) +
        box(fx, fy, -dirt, 1, 1, dirt - lip, '#8A6A45', face) +
        box(fx, fy, -lip, 1, 1, lip, '#74AE52', face)
    }
  }
  s += decal(-4, -4, 8, GRASS, 0)
  for (let i = 0; i < 12; i++) {
    const size = rnd(i, v, 5) < 0.5 ? 0.5 : 1
    s += decal(
      -4 + rnd(i, v, 1) * (8 - size),
      -4 + rnd(i, v, 2) * (8 - size),
      size,
      rnd(i, v, 3) < 0.5 ? '#A3D678' : '#7FB85A',
    )
  }
  const bits: [string, number, Bit?][] = PLOT_BITS[v]
  bits.forEach(([c, count, kind], b) => {
    for (let i = 0; i < count; i++) {
      const x = -3.5 + rnd(i, v, b, 7) * 6.5,
        y = -3.5 + rnd(i, v, b, 8) * 6.5
      if (kind === 'stone') s += box(x, y, 0, 0.7, 0.7, 0.4, c)
      else if (kind === 'tuft')
        for (let k = 0; k < 3; k++)
          s += box(x + k * 0.22, y + (k % 2) * 0.2, 0, 0.14, 0.14, 0.5 + rnd(i, k, v, 9) * 0.6, c)
      else
        s +=
          box(x + 0.1, y + 0.1, 0, 0.15, 0.15, 0.7, '#5C9A42') + box(x, y, 0.7, 0.4, 0.4, 0.15, c)
    }
  })
  return s
}
type Bit = 'stone' | 'tuft'
// What is scattered on each kind of grass plot: a colour, how many, and what it is (a flower unless said).
const PLOT_BITS: [string, number, Bit?][][] = [
  [],
  [['#F6D84E', 3]],
  [
    ['#FBFBF4', 3],
    ['#F29FB6', 2],
  ],
  [['#A9A79F', 3, 'stone']],
  [
    ['#5C9A42', 5, 'tuft'],
    ['#74AE52', 3, 'tuft'],
  ],
  [
    ['#B58BE0', 3],
    ['#F6D84E', 2],
    ['#5C9A42', 3, 'tuft'],
  ],
  [
    ['#A9A79F', 2, 'stone'],
    ['#C2C0B8', 1, 'stone'],
    ['#5C9A42', 4, 'tuft'],
    ['#FBFBF4', 1],
  ],
]
export const PLOT_KINDS = PLOT_BITS.length
// Half-size cubes, so animals can have more detail than trees.
export const small = (list: Voxel[], x: number, y: number, z = 0) => {
  const [sx, sy] = P(x, y, z)
  return `<g transform="translate(${sx} ${sy}) scale(.5)">${vox(list)}</g>`
}
export function egret() {
  const w = '#F7F4EA',
    v: Voxel[] = [
      [0, 0, 0, '#C9A23A'],
      [0, 0, 1, '#C9A23A'],
      [0, 0, 2, '#C9A23A'],
    ]
  for (let x = -2; x < 2; x++) for (let z = 3; z < 5; z++) v.push([x, 0, z, w])
  v.push(
    [-3, 0, 4, w],
    [1, 0, 5, w],
    [1, 0, 6, w],
    [1, 0, 7, w],
    [1, 0, 8, w],
    [2, 0, 8, w],
    [3, 0, 8, '#E58A33'],
  )
  return v
}
export function pond() {
  let s =
    plot(0) +
    decal(-3.4, -3.4, 6.8, '#6C5A45', 0.03) +
    decal(-3, -3, 6, '#5DB3D9', 0.05) +
    decal(-1.2, -2.6, 1.6, '#8FD0EA', 0.07)
  for (let i = 0; i < 8; i++) {
    const a = i * 0.79 + rnd(i, 4),
      x = Math.cos(a) * 3.3 - 0.3,
      y = Math.sin(a) * 3.3 - 0.3
    s += box(x, y, 0, 0.7, 0.7, 0.45, '#A9A79F')
  }
  ;[
    [-2.5, -1, 0.1],
    [1.5, 1.6, 0.12],
    [-1.6, 1.9, 0.1],
    [1.9, -2.3, 0.11],
  ].forEach(([x, y, z], i) => {
    s += decal(x, y, 0.9, '#4F9A52', z)
    if (i % 2 === 0)
      s +=
        box(x + 0.2, y + 0.2, z, 0.5, 0.5, 0.3, '#F29FB6') +
        box(x + 0.32, y + 0.32, z + 0.3, 0.26, 0.26, 0.14, '#FDF3C4')
  })
  return s
}
export const koi = (x = 0, y = 0) =>
  `<g class="life" transform="matrix(4 2 -4 2 ${x} ${y})"><g class="swim"><ellipse cx="1.1" rx=".2" ry=".62" fill="#F07F2E"/><ellipse cx="1.1" cy="-.15" rx=".13" ry=".24" fill="#FFF7EC"/><path d="M1.1 .55L.84 .95L1.36 .95Z" fill="#F07F2E"/></g><g class="swim other"><ellipse cx="1.9" rx=".18" ry=".55" fill="#FFF7EC"/><ellipse cx="1.9" cy=".1" rx=".12" ry=".2" fill="#D9402F"/><path d="M1.9 .48L1.66 .85L2.14 .85Z" fill="#FFF7EC"/></g></g>`
export function rocks() {
  return (
    box(-2.2, -2, 0, 2.6, 2.4, 2, '#9B9992') +
    decal(-2, -1.8, 1.4, '#7FAE5A', 2.02) +
    box(-1.6, -1.5, 2, 1.5, 1.4, 1, '#B4B2AA') +
    box(1, -0.6, 0, 1.5, 1.5, 1, '#A9A79F') +
    decal(1.2, -0.4, 0.8, '#7FAE5A', 1.02) +
    box(-1, 1.4, 0, 1, 1, 0.6, '#8F8D86')
  )
}
export function meadow() {
  let s = ''
  const blades: [number, number, number, string][] = []
  for (let i = 0; i < 34; i++)
    blades.push([
      -3.7 + rnd(i, 31) * 7.2,
      -3.7 + rnd(i, 32) * 7.2,
      0.7 + rnd(i, 33) * 1.5,
      rnd(i, 34) < 0.5 ? '#5C9A42' : '#74AE52',
    ])
  blades
    .sort((a, b) => a[0] + a[1] - b[0] - b[1])
    .forEach(([x, y, h, c]) => {
      s += box(x, y, 0, 0.22, 0.22, h, c)
    })
  ;(
    [
      ['#F6D84E', 3],
      ['#F29FB6', 3],
      ['#FBFBF4', 3],
    ] as [string, number][]
  ).forEach(([c, n], b) => {
    for (let i = 0; i < n; i++) {
      const x = -3.2 + rnd(i, b, 41) * 6,
        y = -3.2 + rnd(i, b, 42) * 6
      s +=
        box(x + 0.1, y + 0.1, 0, 0.15, 0.15, 1.5, '#4F8F3F') +
        box(x - 0.1, y - 0.1, 1.5, 0.55, 0.55, 0.2, c)
    }
  })
  return s
}
// Things standing on a plot, drawn back to front so nearer ones cover farther ones.
const standing = (items: [number, number, string][]) =>
  items
    .sort((a, b) => a[0] + a[1] - b[0] - b[1])
    .map(([, , s]) => s)
    .join('')
const BLOOMS = ['#E5484D', '#F6D84E', '#F29FB6', '#B58BE0', '#FBFBF4', '#F28A3C']
// A flower bed: rows of tulips inside a low stone border.
export function flowers() {
  const items: [number, number, string][] = []
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 6.283,
      x = Math.cos(a) * 3.3 - 0.35,
      y = Math.sin(a) * 3.3 - 0.35
    items.push([x, y, box(x, y, 0, 0.7, 0.7, 0.4, i % 3 ? '#A9A79F' : '#C2C0B8')])
  }
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const x = -2.2 + c * 1.35 + (rnd(r, c, 61) - 0.5) * 0.5,
        y = -2.2 + r * 1.35 + (rnd(r, c, 62) - 0.5) * 0.5,
        h = 1.3 + rnd(r, c, 63) * 0.9,
        bloom = BLOOMS[Math.floor(rnd(r, c, 64) * BLOOMS.length)]
      items.push([
        x,
        y,
        box(x + 0.2, y + 0.2, 0, 0.16, 0.16, h, '#4F8F3F') +
          box(x - 0.15, y + 0.2, h * 0.4, 0.5, 0.16, 0.16, '#5C9A42') +
          box(x, y, h, 0.56, 0.56, 0.6, bloom) +
          box(x + 0.14, y + 0.14, h + 0.6, 0.28, 0.28, 0.16, mix(bloom, 0.35)),
      ])
    }
  return decal(-2.9, -2.9, 5.8, '#7A5A3C', 0.03) + standing(items)
}
// Tall grass in three clumps, with a few cattails.
export function reeds() {
  const items: [number, number, string][] = []
  ;[
    [-1.6, -1.2, 22, 4.2],
    [1.5, 0.4, 16, 3.4],
    [-0.4, 2, 12, 2.6],
  ].forEach(([cx, cy, n, tall], clump) => {
    for (let i = 0; i < n; i++) {
      const a = rnd(i, clump, 71) * 6.283,
        d = rnd(i, clump, 72) * 1.5,
        x = cx + Math.cos(a) * d,
        y = cy + Math.sin(a) * d,
        h = tall * (0.45 + (1 - d / 1.5) * 0.4 + rnd(i, clump, 73) * 0.3)
      let s = box(x, y, 0, 0.2, 0.2, h, ['#4F8F3F', '#5C9A42', '#74AE52', '#8FBF5A'][i % 4])
      if (i % 7 === 0) s += box(x - 0.06, y - 0.06, h, 0.32, 0.32, 0.9, '#7A5230')
      items.push([x, y, s])
    }
  })
  return standing(items)
}
// One big mossy stone with smaller ones and a few flowers around it.
export function boulder() {
  const moss = '#7FAE5A'
  return (
    box(1.6, -2.6, 0, 1.1, 1.1, 0.7, '#8F8D86') +
    box(-2.4, -1.8, 0, 3.6, 3.4, 2.6, '#9B9992') +
    decal(-2.2, -1.6, 1.3, moss, 2.62) +
    decal(-0.4, 0.2, 1, moss, 2.62) +
    box(-1.9, -1.4, 2.6, 2.4, 2.2, 1.5, '#ABA9A1') +
    decal(-1.7, -1.2, 1.2, moss, 4.12) +
    box(-1.4, -1, 4.1, 1.2, 1.1, 0.7, '#BCBAB2') +
    box(1.5, 0.4, 0, 1.6, 1.5, 1.2, '#A9A79F') +
    decal(1.7, 0.6, 0.8, moss, 1.22) +
    box(-0.6, 2.2, 0, 1.2, 1.1, 0.7, '#8F8D86') +
    box(2.5, 2.4, 0, 0.16, 0.16, 1, '#4F8F3F') +
    box(2.3, 2.2, 1, 0.55, 0.55, 0.2, '#FBFBF4') +
    box(-3, 1.6, 0, 0.16, 0.16, 0.8, '#4F8F3F') +
    box(-3.2, 1.4, 0.8, 0.55, 0.55, 0.2, '#F6D84E')
  )
}
export function can() {
  const red = '#C9442F',
    v: Voxel[] = []
  for (let z = 0; z < 3; z++)
    for (let y = 0; y < 2; y++)
      for (let x = 0; x < 3; x++) v.push([x, y, z, z === 2 ? '#DE5B44' : red])
  v.push(
    [3, 0, 1, '#DE5B44'],
    [4, 0, 2, '#DE5B44'],
    [5, 0, 3, '#E8E2D5'],
    [-1, 0, 1, '#8E3424'],
    [-1, 0, 2, '#8E3424'],
    [0, 0, 3, '#8E3424'],
    [1, 0, 3, '#8E3424'],
  )
  return vox(v)
}
const WINGS = [
  ['#F6D84E', '#E0A81F'],
  ['#F28A3C', '#C4501F'],
  ['#8FC7EE', '#3F7FC4'],
  ['#FBFBF4', '#D8D4C4'],
]
export function butterfly(x: number, y: number, i: number, scale = 1) {
  const [a, b] = WINGS[i % WINGS.length]
  const wing = (dir: number) =>
    `<g class="flap" style="animation-delay:${i * 37}ms"><path d="M0 0L${dir * 4.6} -3.6L${dir * 3.8} .6Z" fill="${a}"/><path d="M0 0L${dir * 3.4} .6L${dir * 2.4} 3Z" fill="${b}"/></g>`
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="life w${(i % 3) + 1}" style="animation-delay:${-i * 2.3}s">${wing(-1)}${wing(1)}<rect x="-.5" y="-1.8" width="1" height="3.6" fill="#2E2A26"/></g></g>`
}
export function petals(fallen: string, height: number, i: number) {
  const fill = PAL[fallen][2]
  return [0, 1, 2]
    .map((n) => {
      const x = (rnd(i, n, 51) - 0.5) * 44,
        y = -height * (0.5 + rnd(i, n, 52) * 0.35)
      return `<rect class="life petal" x="${n2(x)}" y="${n2(y)}" width="2.2" height="1.5" rx=".5" fill="${fill}" style="--drop:${n2(-y)}px;--drift:${n2(6 + rnd(i, n, 53) * 8)}px;animation-delay:${n2(-rnd(i, n, 54) * 11)}s"/>`
    })
    .join('')
}
const BEE_ART = (() => {
  const v: Voxel[] = []
  for (let x = -2; x < 3; x++)
    for (let z = 0; z < 2; z++) v.push([x, 0, z, x === 2 || x % 2 ? '#2B2420' : '#F2C12E'])
  return small(v, 0, 0)
})()
const BEE_SECONDS = 13
// With its animation stopped a bee is simply on the ground, so reduced motion needs no special case.
export function landingBee(x: number, y: number, i: number) {
  const side = rnd(x, y, 81) < 0.5 ? -1 : 1, // Off to one side of the plot, where a walking pet's feet don't land.
    turn = rnd(x, y, 82) < 0.5 ? -1 : 1
  return `<g transform="translate(${n2(x + side * 18)} ${n2(y + (rnd(x, y, 83) - 0.5) * 6)}) scale(${turn} 1)"><g class="life visit bee" style="--ax:-70px;--ay:-60px;--lx:70px;--ly:-70px;--d:${BEE_SECONDS}s;--t:${n2(-rnd(x, y, i, 84) * BEE_SECONDS)}s"><g class="rest"><ellipse rx="3" ry="1.5" fill="#122E1C" opacity=".32"/></g><g transform="scale(.75)">${BEE_ART}<g class="air"><g transform="translate(-1 -5)"><g class="flap"><path d="M0 0L-5 -3L-4 1Z" fill="#DDF0FA"/></g><g class="flap"><path d="M0 0L5 -3L4 1Z" fill="#DDF0FA"/></g></g></g><g class="rest"><ellipse cx="-3" cy="-5" rx="2.8" ry="1.5" fill="#DDF0FA"/></g></g></g></g>`
}
export function flock(minX: number, top: number, width: number, height: number) {
  const scale = Math.max(1, width / 760),
    dx = width + 120 * scale,
    dy = -dx * 0.16
  const y0 = top + height * 0.42
  return [
    [0, 0, 0],
    [-20, -9, 0.12],
    [-26, 9, 0.2],
  ]
    .map(
      ([ox, oy, lag]) =>
        `<g class="life fly" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${-4 - lag}s"><g transform="translate(${minX - 60 * scale + ox * scale} ${y0 + oy * scale}) scale(${scale})"><path d="M-3.4 0L3.6 -.6L-.2 1.8Z" style="fill:var(--bird)"/><g class="beat" style="animation-delay:${lag * 900}ms"><path d="M-1.6 0L-3.8 -5L1.6 -.2Z" style="fill:var(--bird)"/></g></g></g>`,
    )
    .join('')
}
