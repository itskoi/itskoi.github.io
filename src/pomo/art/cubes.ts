export type Cube = { x: number; y: number; z: number; p: string; v: number }
export type Grid = Map<number, Cube>
export type LumpOptions = {
  fluff?: number
  holes?: number
  lift?: number
  under?: string
  speck?: [string, number]
  stripe?: [number, string]
  bloom?: number
}

export const rnd = (...v: number[]) => {
  let h = 2166136261
  for (const x of v) {
    h ^= Math.round(x * 7) + 1000
    h = Math.imul(h, 16777619)
    h ^= h >>> 13
  }
  return ((h >>> 0) % 10000) / 10000
}
// Five tones from shadow to highlight. Shadows lean cool and highlights lean warm.
export const PAL: Record<string, string[]> = {
  phuong: ['#7A1A1E', '#B52A22', '#DE4527', '#F2752F', '#FFB65E'],
  mai: ['#A8660F', '#D9941A', '#F2BE2B', '#FADD55', '#FFF4A8'],
  dao: ['#A84868', '#D3708F', '#EE97B2', '#F9C0D0', '#FFE9EE'],
  da: ['#143A2C', '#205C38', '#37803E', '#62A447', '#A6CC60'],
  leaf: ['#1D472D', '#2C6936', '#478C3E', '#72AD4B', '#ABCF68'],
  bamboo: ['#1F5A33', '#2F7A3A', '#4F9C41', '#7FBF4E', '#C2E274'],
  palm: ['#17523A', '#277440', '#449845', '#78BA4E', '#BADB69'],
  culm: ['#3A6E2E', '#55913A', '#78AE45', '#9FC95A', '#D6E58B'],
  sheath: ['#5B4A26', '#7E6A34', '#A3914A', '#BFB064', '#DDD08C'],
  bark: ['#2B1C16', '#46302A', '#66483A', '#86664E', '#A98A6C'],
  plum: ['#22141A', '#3A2329', '#553638', '#6F4C48', '#8E6A5E'],
  rootwood: ['#3A2B20', '#574232', '#755A44', '#927557', '#B39674'],
  tan: ['#4A3626', '#6E5238', '#92724F', '#B0916A', '#D0B48E'],
  coco: ['#2C1B10', '#4A2F1B', '#6B4626', '#8C6236', '#AC8450'],
  soil: ['#3F2A1C', '#5A3E2A', '#755438', '#8F6C4A', '#AB8A64'],
  stone: ['#5F5D58', '#7C7A74', '#9A9891', '#B6B4AC', '#D2D0C8'],
  corgi: ['#A8581E', '#CC7A2E', '#E29A45', '#EFB768', '#F9D596'],
  cream: ['#C9B08C', '#E0CBA8', '#F0E0C4', '#F8EEDC', '#FFFAF0'],
  goldenRich: ['#8E5418', '#B97723', '#D69A38', '#E8B95B', '#F5D58C'],
  goldenLight: ['#BC8636', '#D8A654', '#EBC37A', '#F5D99E', '#FCECC6'],
  goldenEar: ['#6E3E12', '#8E5518', '#A96C22', '#BF8433', '#D29C4B'],
  shiba: ['#A64E1C', '#C76A28', '#DE883A', '#EDA75C', '#F7C68A'],
  ginger: ['#B86A1E', '#D98A2C', '#EEA848', '#F7C470', '#FDE0A4'],
  gingerStripe: ['#8E4E14', '#AE681C', '#C8802A', '#DC9A3C', '#EAB458'],
  whitecat: ['#B9B4AC', '#D6D1C9', '#EBE7DF', '#F6F3EC', '#FFFFFF'],
  blackcat: ['#0F0E14', '#1C1A24', '#2C2936', '#413E4D', '#5F5C6E'],
  pink: ['#C77B8B', '#E09AA8', '#F0B6C0', '#F8CFD6', '#FFE6EA'],
}
const toneCache = new Map<string, string>()
export function tone(pal: string, v: number) {
  const i = Math.round(Math.min(1, Math.max(0, v)) * 40),
    key = pal + i
  if (!toneCache.has(key)) {
    const stops = PAL[pal] || [pal, pal]
    const at = (i / 40) * (stops.length - 1),
      a = Math.min(stops.length - 2, Math.floor(at)),
      t = at - a
    const ch = (h: string, n: number) => parseInt(h.slice(1 + n * 2, 3 + n * 2), 16)
    toneCache.set(
      key,
      `rgb(${[0, 1, 2].map((n) => Math.round(ch(stops[a], n) * (1 - t) + ch(stops[a + 1], n) * t)).join(',')})`,
    )
  }
  return toneCache.get(key) as string
}
export const K = (x: number, y: number, z: number) =>
  (x + 128) | ((y + 128) << 8) | ((z + 16) << 16)
export const put = (g: Grid, x: number, y: number, z: number, p: string, v: number) => {
  if (z >= 0) g.set(K(x, y, z), { x, y, z, p, v })
}
// A puff of foliage. Each puff is lit as its own ball, which is what makes a crown look soft and full.
export function lump(
  g: Grid,
  cx: number,
  cy: number,
  cz: number,
  r: number,
  rz: number,
  p: string,
  o: LumpOptions = {},
) {
  const rr = Math.ceil(r) + 1,
    rh = Math.ceil(rz) + 1
  for (let z = Math.floor(cz) - rh; z <= cz + rh; z++)
    for (let y = Math.floor(cy) - rr; y <= cy + rr; y++)
      for (let x = Math.floor(cx) - rr; x <= cx + rr; x++) {
        const dx = (x + 0.5 - cx) / r,
          dy = (y + 0.5 - cy) / r,
          dz = (z + 0.5 - cz) / rz,
          d = dx * dx + dy * dy + dz * dz,
          n = rnd(x, y, z, 1)
        if (d > 1 - n * (o.fluff ?? 0.2) || (o.holes && d > 0.3 && rnd(x, y, z, 9) < o.holes))
          continue
        const light = -dx * 0.38 + dy * 0.38 + dz * 0.84
        let pal = p,
          v = 0.5 + light * 0.42 + (n - 0.5) * 0.2 + (o.lift || 0)
        if (o.under && dz < -0.05 && rnd(z, y, x, 2) < 0.75) {
          pal = o.under
          v -= 0.05
        }
        if (o.speck && rnd(y, x, z, 5) < o.speck[1]) pal = o.speck[0]
        if (o.stripe && z % o.stripe[0] === 0) pal = o.stripe[1]
        put(g, x, y, z, pal, v)
        if (o.bloom && dz > 0.1 && d > 0.5 && rnd(x, z, y, 8) < o.bloom)
          put(g, x, y, z + 1, p, 0.86 + n * 0.14)
      }
}
// A trunk or branch along a line, tapering from r0 to r1.
export function limb(
  g: Grid,
  pts: number[][],
  r0: number,
  r1: number,
  p: string,
  o: { band?: number; lift?: number } = {},
) {
  let total = 0
  for (let i = 1; i < pts.length; i++)
    total += Math.hypot(
      pts[i][0] - pts[i - 1][0],
      pts[i][1] - pts[i - 1][1],
      pts[i][2] - pts[i - 1][2],
    )
  let run = 0
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]],
      len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) || 1
    for (let s = 0; s <= len; s += 0.35) {
      const t = s / len,
        px = a[0] + (b[0] - a[0]) * t,
        py = a[1] + (b[1] - a[1]) * t,
        pz = a[2] + (b[2] - a[2]) * t
      const r = Math.max(0.72, r0 + (r1 - r0) * ((run + s) / total)),
        c = Math.ceil(r) + 1
      for (let dz = -c; dz <= c; dz++)
        for (let dy = -c; dy <= c; dy++)
          for (let dx = -c; dx <= c; dx++) {
            const x = Math.floor(px) + dx,
              y = Math.floor(py) + dy,
              z = Math.floor(pz) + dz
            const ox = x + 0.5 - px,
              oy = y + 0.5 - py,
              oz = z + 0.5 - pz
            if (Math.hypot(ox, oy, oz) > r) continue
            let v = 0.5 + ((-ox + oy) / r) * 0.22 + (rnd(x, y, z, 3) - 0.5) * 0.2
            if (o.band && z % o.band === 0) v -= 0.17
            put(g, x, y, z, p, v + (o.lift || 0))
          }
    }
    run += len
  }
}
// Paints cubes back to front, skipping hidden faces and darkening faces with cubes above them.
export function paint(ctx: CanvasRenderingContext2D, g: Grid, tu: number) {
  const TP = (a: number, b: number, c: number): [number, number] => [
    (a - b) * tu,
    ((a + b) * tu) / 2 - c * tu,
  ]
  ctx.lineWidth = 0.22
  const has = (x: number, y: number, z: number) => g.has(K(x, y, z))
  const fill = (
    color: string,
    a: [number, number],
    b: [number, number],
    d: [number, number],
    e: [number, number],
  ) => {
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(...a)
    ctx.lineTo(...b)
    ctx.lineTo(...d)
    ctx.lineTo(...e)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  ;[...g.values()]
    .sort((a, b) => a.x + a.y + a.z - b.x - b.y - b.z)
    .forEach(({ x, y, z, p, v }) => {
      if (!has(x, y + 1, z))
        fill(
          tone(p, v - 0.07 - (has(x, y + 1, z + 1) ? 0.09 : 0)),
          TP(x, y + 1, z + 1),
          TP(x + 1, y + 1, z + 1),
          TP(x + 1, y + 1, z),
          TP(x, y + 1, z),
        )
      if (!has(x + 1, y, z))
        fill(
          tone(p, v - 0.21 - (has(x + 1, y, z + 1) ? 0.09 : 0)),
          TP(x + 1, y, z + 1),
          TP(x + 1, y + 1, z + 1),
          TP(x + 1, y + 1, z),
          TP(x + 1, y, z),
        )
      if (!has(x, y, z + 1)) {
        const crowd =
          (has(x + 1, y, z + 1) ? 1 : 0) +
          (has(x, y + 1, z + 1) ? 1 : 0) +
          (has(x - 1, y, z + 1) ? 1 : 0) +
          (has(x, y - 1, z + 1) ? 1 : 0)
        fill(
          tone(p, v + 0.11 - crowd * 0.05),
          TP(x, y, z + 1),
          TP(x + 1, y, z + 1),
          TP(x + 1, y + 1, z + 1),
          TP(x, y + 1, z + 1),
        )
      }
    })
}
