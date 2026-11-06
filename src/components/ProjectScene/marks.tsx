import type { CSSProperties, ReactNode } from 'react'
import styles from './ProjectScene.module.css'

// The drawing vocabulary every scene shares. Each mark builds in once, `d` seconds after it mounts.

export const at = (seconds: number, extra?: Record<string, string>) =>
  ({ '--d': `${seconds}s`, ...extra }) as CSSProperties

// "{x}" marks the part a reader should catch, drawn in red.
export const rich = (text: string) =>
  text.split(/\{(.+?)\}/).map((part, index) =>
    index % 2 ? (
      <tspan key={part} className={styles.accentText}>
        {part}
      </tspan>
    ) : (
      part
    ),
  )

const anchors = { start: '', middle: styles.middle, end: styles.end }
type Anchor = keyof typeof anchors

// A line starting with "~" is muted.
export function Line({
  x,
  y,
  text,
  d,
  small,
  anchor = 'start',
}: {
  x: number
  y: number
  text: string
  d: number
  small?: boolean
  anchor?: Anchor
}) {
  const muted = text.startsWith('~')
  return (
    <text
      x={x}
      y={y}
      className={`${muted ? styles.mutedText : styles.text} ${small ? styles.small : ''} ${anchors[anchor]} ${styles.fade}`}
      style={at(d)}
    >
      {rich(muted ? text.slice(1) : text)}
    </text>
  )
}

export function Label({
  x,
  y,
  d,
  children,
  anchor = 'start',
}: {
  x: number
  y: number
  d: number
  children: string
  anchor?: Anchor
}) {
  return (
    <text x={x} y={y} className={`${styles.label} ${anchors[anchor]} ${styles.fade}`} style={at(d)}>
      {children}
    </text>
  )
}

export function Rect({
  x,
  y,
  w,
  h,
  d,
  accent,
  rx,
}: {
  x: number
  y: number
  w: number
  h: number
  d: number
  accent?: boolean
  rx?: number
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      className={`${accent ? styles.accentBox : styles.box} ${styles.pop}`}
      style={at(d)}
    />
  )
}

export function Chip({
  x,
  y,
  w,
  h = 26,
  text,
  d,
  accent,
}: {
  x: number
  y: number
  w: number
  h?: number
  text: string
  d: number
  accent?: boolean
}) {
  return (
    <g className={styles.pop} style={at(d)}>
      <rect x={x} y={y} width={w} height={h} className={accent ? styles.accentBox : styles.box} />
      <text
        x={x + w / 2}
        y={y + h / 2}
        className={`${styles.text} ${styles.small} ${styles.middle}`}
      >
        {rich(text)}
      </text>
    </g>
  )
}

export function Arrow({
  from,
  to,
  d,
}: {
  from: readonly [number, number]
  to: readonly [number, number]
  d: number
}) {
  const [x1, y1] = from
  const [x2, y2] = to
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = [-0.45, 0.45].map(
    (spread) => `${x2 - 9 * Math.cos(angle + spread)},${y2 - 9 * Math.sin(angle + spread)}`,
  )
  return (
    <>
      <path
        d={`M${x1} ${y1}L${x2} ${y2}`}
        pathLength={1}
        className={`${styles.wire} ${styles.draw}`}
        style={at(d)}
      />
      <polygon
        points={`${x2},${y2} ${head.join(' ')}`}
        className={`${styles.inkFill} ${styles.fade}`}
        style={at(d + 0.3)}
      />
    </>
  )
}

export function Wire({ path, d, accent }: { path: string; d: number; accent?: boolean }) {
  return (
    <path
      d={path}
      pathLength={1}
      className={`${accent ? styles.check : styles.wire} ${styles.draw}`}
      style={at(d)}
    />
  )
}

export function Check({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <path
      d={`M${x} ${y}l4.5 4.5l9 -10`}
      pathLength={1}
      className={`${styles.check} ${styles.draw}`}
      style={at(d)}
    />
  )
}

export function Cross({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <path
      d={`M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8`}
      className={`${styles.cross} ${styles.fade}`}
      style={at(d)}
    />
  )
}

export function Retry({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <g className={styles.fade} style={at(d)}>
      <path d={`M${x + 6} ${y}A6 6 0 1 1 ${x} ${y - 6}`} className={styles.check} />
      <polygon
        points={`${x + 3.5},${y - 6} ${x - 1},${y - 9.5} ${x - 1},${y - 2.5}`}
        className={styles.accentFill}
      />
    </g>
  )
}

// A voice clip's waveform, 440 wide, centred on y.
export function Wave({ x, y, d }: { x: number; y: number; d: number }) {
  return Array.from({ length: 40 }, (_, index) => {
    const height = 4 + 20 * Math.abs(Math.sin(index * 0.55) * Math.sin(index * 0.13 + 1))
    const left = x + index * 11
    return (
      <rect
        key={left}
        x={left}
        y={y - height / 2}
        width={4}
        height={height}
        className={`${styles.inkFill} ${styles.growY}`}
        style={at(d + index * 0.01)}
      />
    )
  })
}

// Deterministic noise, so a scene never differs between renders.
const noiseAt = (col: number, row: number, frame: number) =>
  ((col * 7919 + row * 104729 + frame * 1299709) % 97) / 97

// A row of cells whose shade stands for feature values.
export function Strip({ x, y, d, cell = 13 }: { x: number; y: number; d: number; cell?: number }) {
  return (
    <g className={styles.fade} style={at(d)}>
      {Array.from({ length: 20 }, (_, index) => {
        const left = x + index * cell
        return (
          <rect
            key={left}
            x={left}
            y={y}
            width={cell - 2}
            height={18}
            opacity={0.25 + noiseAt(index, 3, 1) * 0.75}
            className={index % 7 === 2 ? styles.accentFill : styles.inkFill}
          />
        )
      })}
    </g>
  )
}

// A 12 × 12 picture of a sun over a hill, blended with noise.
export function Frame({
  x,
  y,
  cell,
  noise,
  d,
}: {
  x: number
  y: number
  cell: number
  noise: number
  d: number
}) {
  const cells: ReactNode[] = []
  for (let row = 0; row < 12; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const isSun = (col - 8) ** 2 + (row - 3.5) ** 2 <= 5
      const isHill = row >= 6.5 + 0.12 * (col - 3.5) ** 2
      const target = isSun || isHill ? 1 : 0
      const value = target * (1 - noise) + noiseAt(col, row, Math.round(noise * 9)) * noise
      cells.push(
        <rect
          key={`${col}-${row}`}
          x={x + col * cell}
          y={y + row * cell}
          width={cell}
          height={cell}
          opacity={value}
          className={isSun && noise < 0.5 ? styles.accentFill : styles.inkFill}
        />,
      )
    }
  }
  return (
    <g className={styles.fade} style={at(d)}>
      <rect x={x} y={y} width={cell * 12} height={cell * 12} className={styles.box} />
      {cells}
    </g>
  )
}

// Tokens → PhoBERT → a feature strip; both research scenes open with it.
export function Encode({ tokens }: { tokens: readonly (readonly [string, number])[] }) {
  let x = 0
  return (
    <>
      {tokens.map(([token, width], index) => {
        const chip = <Chip key={token} x={x} y={0} w={width} text={token} d={0.15 + index * 0.08} />
        x += width + 7
        return chip
      })}
      <Arrow from={[130, 26]} to={[130, 42]} d={0.5} />
      <Chip x={0} y={42} w={260} text="PhoBERT" d={0.65} accent />
      <Arrow from={[130, 68]} to={[130, 84]} d={0.9} />
      <Strip x={0} y={86} d={1.05} />
      <Line x={290} y={95} text="~sentence features" d={1.15} small />
    </>
  )
}
