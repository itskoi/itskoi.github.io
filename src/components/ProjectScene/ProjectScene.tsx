import type { CSSProperties, ReactNode } from 'react'
import type { SceneId } from '@/data/portfolio'
import styles from './ProjectScene.module.css'

// Drawn from the resume's own words. Values such as "32 g" are examples, which
// every caption states; numbers the resume hides must not appear here.

const WIDTH = 480
const HEIGHT = 440

const at = (seconds: number, extra?: Record<string, string>) =>
  ({ '--d': `${seconds}s`, ...extra }) as CSSProperties

function Box({
  x,
  y,
  w,
  h,
  label,
  d,
  accent,
}: {
  x: number
  y: number
  w: number
  h: number
  label?: string
  d: number
  accent?: boolean
}) {
  return (
    <g className={styles.pop} style={at(d)}>
      <rect x={x} y={y} width={w} height={h} className={accent ? styles.accentBox : styles.box} />
      {label && (
        <text x={x + w / 2} y={y + h / 2} className={`${styles.text} ${styles.middle}`}>
          {label}
        </text>
      )}
    </g>
  )
}

function Arrow({
  from,
  to,
  d,
  accent,
}: {
  from: readonly [number, number]
  to: readonly [number, number]
  d: number
  accent?: boolean
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
        className={`${accent ? styles.check : styles.wire} ${styles.draw}`}
        style={at(d)}
      />
      <polygon
        points={`${x2},${y2} ${head.join(' ')}`}
        className={`${accent ? styles.accentFill : styles.inkFill} ${styles.fade}`}
        style={at(d + 0.3)}
      />
    </>
  )
}

function Check({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <path
      d={`M${x} ${y}l4.5 4.5l9 -10`}
      pathLength={1}
      className={`${styles.check} ${styles.draw}`}
      style={at(d)}
    />
  )
}

function Label({ x, y, d, children }: { x: number; y: number; d: number; children: string }) {
  return (
    <text x={x} y={y} className={`${styles.label} ${styles.fade}`} style={at(d)}>
      {children}
    </text>
  )
}

function Guardrail({ y, d, label }: { y: number; d: number; label: string }) {
  return (
    <>
      <Box x={8} y={y} w={464} h={28} d={d} accent />
      <text x={20} y={y + 14} className={`${styles.text} ${styles.fade}`} style={at(d)}>
        {label}
      </text>
      <Check x={450} y={y + 14} d={d + 0.25} />
    </>
  )
}

function Companion() {
  const planner = [
    { label: 'Break down', x: 12, d: 1 },
    { label: 'Call tools', x: 132, d: 1.2 },
    { label: 'Observe', x: 252, d: 1.4 },
    { label: 'Claims', x: 372, d: 1.7 },
  ]
  const ledger = [
    { claim: 'Target 90 g', source: 'profile', d: 2.55 },
    { claim: 'Eaten 58 g', source: 'food log', d: 2.7 },
    { claim: 'Protein at dinner', source: 'guideline', d: 2.85 },
  ]
  return (
    <>
      <Box x={8} y={4} w={464} h={26} d={0.1} label="How much protein do I have left today?" />
      <Arrow from={[240, 30]} to={[240, 48]} d={0.25} />
      <Guardrail y={48} d={0.4} label="Input guardrail: not harmful, rewrite if needed" />
      <Arrow from={[240, 76]} to={[240, 114]} d={0.75} />
      <Box x={336} y={84} w={136} h={22} d={0.8} label="User behaviors" />
      <Arrow from={[336, 95]} to={[240, 95]} d={0.9} />

      <rect
        x={3}
        y={114}
        width={474}
        height={90}
        className={`${styles.boundary} ${styles.fade}`}
        style={at(0.9)}
      />
      <Label x={12} y={127} d={0.9}>
        PLANNER
      </Label>
      {planner.map(({ label, x, d }, index) => (
        <g key={label}>
          <Box x={x} y={138} w={100} h={28} d={d} label={label} />
          {index > 0 && <Arrow from={[x - 20, 152]} to={[x, 152]} d={d - 0.15} />}
        </g>
      ))}
      <path
        d="M302 166V182H182"
        pathLength={1}
        className={`${styles.wire} ${styles.draw}`}
        style={at(1.5)}
      />
      <Arrow from={[182, 182]} to={[182, 166]} d={1.7} />
      <text
        x={242}
        y={192}
        className={`${styles.label} ${styles.middle} ${styles.fade}`}
        style={at(1.7)}
      >
        REPLAN
      </text>
      <Arrow from={[240, 204]} to={[240, 222]} d={1.9} />

      <rect
        x={3}
        y={222}
        width={474}
        height={116}
        className={`${styles.boundary} ${styles.fade}`}
        style={at(2)}
      />
      <Label x={12} y={235} d={2}>
        ANSWERER
      </Label>
      <Box x={12} y={246} w={136} h={28} d={2.1} label="Gather claims" />
      <Arrow from={[148, 260]} to={[172, 260]} d={2.25} />
      <Box x={172} y={246} w={100} h={28} d={2.4} label="Ledger" />
      {ledger.map(({ claim, source, d }, index) => {
        const y = 290 + index * 18
        return (
          <g key={source}>
            <g className={styles.fade} style={at(d)}>
              <text x={12} y={y} className={styles.text}>
                {claim}
              </text>
              <text x={170} y={y} className={styles.mutedText}>
                {source}
              </text>
            </g>
            <Check x={258} y={y} d={d + 0.1} />
          </g>
        )
      })}
      <Arrow from={[272, 260]} to={[296, 260]} d={2.95} />
      <Box x={296} y={246} w={176} h={28} d={3.05} label="Result" />
      <g className={styles.fade} style={at(3.2)}>
        <text x={296} y={290} className={styles.text}>
          You have <tspan className={styles.accentText}>32 g</tspan> left.
        </text>
        <text x={296} y={308} className={styles.text}>
          Dinner protein <tspan className={styles.accentText}>[1]</tspan>
        </text>
        <text x={296} y={326} className={styles.mutedText}>
          [1] guideline
        </text>
      </g>
      <Arrow from={[240, 338]} to={[240, 356]} d={3.4} />

      <Guardrail y={356} d={3.55} label="Output guardrail: figures sourced, guideline cited" />

      <Arrow from={[240, 384]} to={[240, 408]} d={3.95} />
      <Label x={8} y={396} d={4}>
        FINAL ANSWER
      </Label>
      <g className={styles.pop} style={at(4.15)}>
        <rect x={8} y={408} width={464} height={30} className={styles.box} />
        <text x={20} y={423} className={styles.text}>
          You have <tspan className={styles.accentText}>32 g</tspan> left. Add protein at dinner.{' '}
          <tspan className={styles.accentText}>[1]</tspan>
        </text>
      </g>
    </>
  )
}

function Meals() {
  const retrieved = new Set([3, 12, 18, 29])
  const meals = [
    { name: 'meal A', portion: 0.8, rank: 1 },
    { name: 'meal B', portion: 1.1, rank: 3 },
    { name: 'meal C', portion: 1.2, rank: 0 },
    { name: 'meal D', portion: 0.9, rank: 2 },
  ]
  const top = [...meals].sort((a, b) => a.rank - b.rank).slice(0, 3)
  return (
    <>
      <Label x={8} y={12} d={0.1}>
        REMAINING CALORIES
      </Label>
      <rect
        x={8}
        y={24}
        width={312}
        height={18}
        className={`${styles.mutedFill} ${styles.grow}`}
        style={at(0.2)}
      />
      <rect
        x={320}
        y={24}
        width={152}
        height={18}
        className={`${styles.accentFill} ${styles.grow}`}
        style={at(0.5)}
      />
      <text x={8} y={56} className={`${styles.mutedText} ${styles.fade}`} style={at(0.3)}>
        eaten 1350 of 2000 kcal
      </text>
      <text
        x={472}
        y={56}
        className={`${styles.accentText} ${styles.end} ${styles.fade}`}
        style={at(0.7)}
      >
        650 kcal left
      </text>
      <Arrow from={[240, 66]} to={[240, 80]} d={0.8} />

      <Box x={8} y={80} w={150} h={30} d={1} label="user tower" />
      <Box x={322} y={80} w={150} h={30} d={1} label="meal tower" />
      <Label x={204} y={95} d={1}>
        RETRIEVAL
      </Label>
      <Arrow from={[83, 110]} to={[83, 124]} d={1.1} />
      <Arrow from={[397, 110]} to={[397, 124]} d={1.1} />
      {Array.from({ length: 32 }, (_, index) => {
        const cx = 24 + (index % 16) * 29
        const cy = 134 + Math.floor(index / 16) * 18
        const key = `${cx}-${cy}`
        return (
          <g key={key}>
            <g className={styles.fade} style={at(1.2 + (index % 16) * 0.01)}>
              <circle
                cx={cx}
                cy={cy}
                r={5}
                className={`${styles.inkFill} ${styles.dim}`}
                style={at(1.5)}
              />
            </g>
            {retrieved.has(index) && (
              <circle
                cx={cx}
                cy={cy}
                r={6}
                className={`${styles.accentFill} ${styles.pop}`}
                style={at(1.5)}
              />
            )}
          </g>
        )
      })}
      <Arrow from={[240, 160]} to={[240, 182]} d={1.8} />

      <Label x={8} y={171} d={1.9}>
        OPTIMIZE PORTION
      </Label>
      {meals.map(({ name, portion }, index) => {
        const x = 8 + index * 118
        const d = 2 + index * 0.1
        return (
          <g key={name}>
            <Box x={x} y={184} w={110} h={48} d={d} />
            <g className={styles.fade} style={at(d)}>
              <text x={x + 8} y={200} className={styles.text}>
                {name}
              </text>
              <text x={x + 102} y={200} className={`${styles.mutedText} ${styles.end}`}>
                ×{portion}
              </text>
              <rect x={x + 8} y={214} width={94} height={8} className={styles.box} />
            </g>
            <rect
              x={x + 8}
              y={214}
              width={70 * portion}
              height={8}
              className={`${styles.accentFill} ${styles.grow}`}
              style={at(d + 0.15)}
            />
          </g>
        )
      })}
      <Arrow from={[240, 232]} to={[240, 254]} d={2.6} />

      <Label x={8} y={243} d={2.7}>
        RERANK: LIGHTGBM
      </Label>
      {meals.map(({ name, rank }, index) => {
        const y = 256 + rank * 26
        return (
          <g key={name} className={styles.pop} style={at(2.8)}>
            <g className={styles.rerank} style={at(3.2, { '--dy': `${(index - rank) * 26}px` })}>
              <text x={8} y={y + 9} className={styles.text}>
                {name}
              </text>
              <rect
                x={72}
                y={y}
                width={280 - rank * 44}
                height={18}
                className={rank < 3 ? styles.accentFill : styles.mutedFill}
              />
            </g>
          </g>
        )
      })}
      <Arrow from={[240, 354]} to={[240, 374]} d={3.8} />

      <Label x={8} y={364} d={3.9}>
        OUTPUT MEALS
      </Label>
      {top.map(({ name, portion }, index) => (
        <Box
          key={name}
          x={8 + index * 157}
          y={376}
          w={150}
          h={38}
          d={4 + index * 0.15}
          accent={index === 0}
          label={`${name} × ${portion}`}
        />
      ))}
    </>
  )
}

function Sdd() {
  const steps = ['Jira ticket', 'AI-written spec', 'Task list', 'Implementation', 'AI code review']
  const taskWidths = [132, 104, 146, 92, 120]
  return (
    <>
      {steps.map((step, index) => {
        const y = 6 + index * 54
        const d = 0.1 + index * 0.4
        return (
          <g key={step}>
            <Box x={8} y={y} w={200} h={36} d={d} accent={index === 2} label={step} />
            {index < steps.length - 1 && (
              <Arrow from={[108, y + 36]} to={[108, y + 54]} d={d + 0.2} />
            )}
          </g>
        )
      })}
      <Arrow from={[208, 132]} to={[252, 132]} d={1} />
      <Box x={252} y={42} w={220} h={198} d={1.1} />
      <Label x={268} y={62} d={1.2}>
        TASKS
      </Label>
      {taskWidths.map((width, index) => {
        const y = 80 + index * 30
        return (
          <g key={width}>
            <g className={styles.fade} style={at(1.2)}>
              <rect x={268} y={y} width={18} height={18} className={styles.box} />
              <rect x={298} y={y + 6} width={width} height={6} className={styles.mutedFill} />
            </g>
            <Check x={270} y={y + 9} d={1.6 + index * 0.25} />
          </g>
        )
      })}
      <Arrow from={[108, 258]} to={[108, 304]} d={2.9} />
      <Label x={122} y={284} d={3}>
        AGENT-DRIVEN E2E
      </Label>
      <Box x={8} y={304} w={260} h={96} d={3.2} />
      <path d="M8 326H268" className={`${styles.wire} ${styles.fade}`} style={at(3.2)} />
      <text
        x={138}
        y={362}
        className={`${styles.text} ${styles.middle} ${styles.fade}`}
        style={at(3.3)}
      >
        Web: Playwright
      </text>
      <Check x={232} y={362} d={3.7} />
      <Box x={304} y={304} w={60} h={96} d={3.4} />
      <text x={376} y={342} className={`${styles.text} ${styles.fade}`} style={at(3.5)}>
        Mobile:
      </text>
      <text x={376} y={362} className={`${styles.text} ${styles.fade}`} style={at(3.5)}>
        Maestro
      </text>
      <Check x={326} y={354} d={3.9} />
    </>
  )
}

function Voice() {
  const fields = [
    ['food', 'mì bò', 80],
    ['brand', '–', 70],
    ['alt name', 'mì thịt bò', 116],
    ['tag', 'cooked', 88],
    ['grams', '450', 86],
  ] as const
  const results = [
    { name: 'mì bò', tag: 'cooked', dy: 40, top: true },
    { name: 'mì gói', tag: 'processed', dy: -40, top: false },
    { name: 'bún bò', tag: 'cooked', dy: 0, top: false },
  ]
  return (
    <>
      {Array.from({ length: 44 }, (_, index) => {
        const height = 8 + 40 * Math.abs(Math.sin(index * 0.55) * Math.sin(index * 0.13 + 1))
        const x = 9 + index * 10.6
        return (
          <rect
            key={x}
            x={x}
            y={30 - height / 2}
            width={5}
            height={height}
            className={`${styles.inkFill} ${styles.growY}`}
            style={at(index * 0.012)}
          />
        )
      })}
      <Box x={130} y={62} w={220} h={36} d={0.6} label="một tô mì bò" />
      <Arrow from={[240, 98]} to={[240, 122]} d={0.9} />
      <Label x={8} y={110} d={1}>
        LLM: STRUCTURED QUERY
      </Label>
      {fields.map(([key, value, width], index) => {
        const x = 8 + fields.slice(0, index).reduce((sum, field) => sum + field[2] + 6, 0)
        const d = 1.1 + index * 0.1
        return (
          <g key={key}>
            <Box x={x} y={124} w={width} h={52} d={d} />
            <g className={styles.fade} style={at(d)}>
              <text x={x + width / 2} y={140} className={`${styles.label} ${styles.middle}`}>
                {key.toUpperCase()}
              </text>
              <text x={x + width / 2} y={160} className={`${styles.text} ${styles.middle}`}>
                {value}
              </text>
            </g>
          </g>
        )
      })}
      <Arrow from={[240, 176]} to={[240, 202]} d={1.8} />
      <Label x={8} y={190} d={1.9}>
        SEARCH, THEN RERANK
      </Label>
      {results.map(({ name, tag, dy, top }, index) => {
        const y = 206 + index * 40
        return (
          <g key={name} className={styles.pop} style={at(2.1 + index * 0.1)}>
            <g className={styles.rerank} style={at(2.9, { '--dy': `${dy}px` })}>
              <rect
                x={8}
                y={y}
                width={464}
                height={34}
                className={top ? styles.accentBox : styles.box}
              />
              <text x={24} y={y + 17} className={styles.text}>
                {name}
              </text>
              <text x={456} y={y + 17} className={`${styles.mutedText} ${styles.end}`}>
                {tag}
              </text>
            </g>
          </g>
        )
      })}
      <g className={styles.pop} style={at(3.7)}>
        <text x={8} y={352} className={styles.result}>
          +30 percentage points
        </text>
        <text x={8} y={382} className={styles.mutedText}>
          Recall@3 over keyword search alone
        </text>
      </g>
    </>
  )
}

function Rag() {
  return (
    <>
      <rect
        x={3}
        y={3}
        width={474}
        height={292}
        className={`${styles.boundary} ${styles.fade}`}
        style={at(0.1)}
      />
      <Label x={16} y={20} d={0.1}>
        ON-PREMISES
      </Label>

      <Box x={24} y={36} w={56} h={66} d={0.2} />
      <Box x={16} y={42} w={56} h={66} d={0.3} />
      <g className={styles.fade} style={at(0.4)}>
        {[0, 1, 2, 3].map((line) => (
          <rect
            key={line}
            x={24}
            y={54 + line * 12}
            width={40}
            height={4}
            className={styles.mutedFill}
          />
        ))}
      </g>
      <Label x={10} y={120} d={0.4}>
        PDF, ~2 GB
      </Label>
      <Arrow from={[80, 72]} to={[100, 72]} d={0.5} />
      <Box x={100} y={36} w={84} h={72} d={0.7} label="Parse" />
      <Arrow from={[184, 72]} to={[204, 72]} d={0.9} />
      <Box x={204} y={36} w={120} h={72} d={1.1} />
      <g className={styles.fade} style={at(1.2)}>
        <text x={216} y={60} className={styles.text}>
          ## Clocks
        </text>
        <text x={216} y={84} className={styles.mutedText}>
          - period
        </text>
      </g>
      <Label x={232} y={120} d={1.2}>
        MARKDOWN
      </Label>
      <Arrow from={[324, 72]} to={[344, 72]} d={1.3} />
      <Box x={344} y={36} w={120} h={72} d={1.5} label="Index" />

      <Arrow from={[404, 108]} to={[404, 150]} d={1.7} />
      <Label x={330} y={128} d={1.8}>
        RETRIEVE
      </Label>
      <Box x={16} y={170} w={244} h={36} d={1.7} label="Which command sets a clock?" />
      <Arrow from={[260, 188]} to={[290, 188]} d={1.9} />
      <Box x={290} y={150} w={174} h={76} d={2} accent />
      <text
        x={377}
        y={168}
        className={`${styles.text} ${styles.middle} ${styles.fade}`}
        style={at(2)}
      >
        LangGraph
      </text>
      <Box x={302} y={184} w={150} h={32} d={2.1} label="Self-hosted LLM" />
      <Arrow from={[377, 226]} to={[377, 250]} d={2.3} />
      <Box x={204} y={250} w={260} h={36} d={2.5} label="create_clock -period 10" />

      <Label x={8} y={318} d={2.8}>
        COMMAND LOOKUP
      </Label>
      <text x={8} y={343} className={`${styles.text} ${styles.fade}`} style={at(2.8)}>
        PDFs
      </text>
      <rect
        x={72}
        y={334}
        width={330}
        height={18}
        className={`${styles.mutedFill} ${styles.grow}`}
        style={at(2.9, { '--t': '1.2s' })}
      />
      <text
        x={472}
        y={343}
        className={`${styles.mutedText} ${styles.end} ${styles.fade}`}
        style={at(4)}
      >
        ~1 min
      </text>
      <text x={8} y={371} className={`${styles.text} ${styles.fade}`} style={at(2.8)}>
        Chat
      </text>
      <rect
        x={72}
        y={362}
        width={52}
        height={18}
        className={`${styles.accentFill} ${styles.grow}`}
        style={at(2.9, { '--t': '0.3s' })}
      />
      <text x={136} y={371} className={`${styles.accentText} ${styles.fade}`} style={at(3.2)}>
        &lt;10 s
      </text>
      <g className={styles.pop} style={at(4.2)}>
        <text x={8} y={414} className={styles.result}>
          95%
        </text>
        <text x={82} y={414} className={styles.mutedText}>
          answer accuracy, hand-built eval
        </text>
      </g>
    </>
  )
}

const CELLS = 12

// Deterministic noise, so a scene never differs between renders.
const noiseAt = (col: number, row: number, frame: number) =>
  ((col * 7919 + row * 104729 + frame * 1299709) % 97) / 97

function Frame({ x, y, noise, d }: { x: number; y: number; noise: number; d: number }) {
  const cell = 10
  const cells: ReactNode[] = []
  for (let row = 0; row < CELLS; row += 1) {
    for (let col = 0; col < CELLS; col += 1) {
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
      <rect x={x} y={y} width={CELLS * cell} height={CELLS * cell} className={styles.box} />
      {cells}
    </g>
  )
}

function TextToImage() {
  const stages = [
    { x: 14, noise: 1, d: 1.4 },
    { x: 180, noise: 0.66, d: 2.1 },
    { x: 346, noise: 0.33, d: 2.8 },
  ]
  return (
    <>
      <Box x={8} y={6} w={210} h={40} d={0.1} label="mặt trời trên đồi" />
      <Arrow from={[218, 26]} to={[300, 26]} d={0.4} />
      <Box x={300} y={6} w={172} h={40} d={0.6} accent label="PhoBERT" />
      <path
        d="M386 46V70"
        pathLength={1}
        className={`${styles.check} ${styles.draw}`}
        style={at(0.9)}
      />
      <path
        d="M74 70H406"
        pathLength={1}
        className={`${styles.check} ${styles.draw}`}
        style={at(1.1)}
      />
      <Label x={8} y={58} d={1.1}>
        SKIP CONNECTIONS
      </Label>
      <rect
        x={6}
        y={84}
        width={468}
        height={194}
        className={`${styles.boundary} ${styles.fade}`}
        style={at(1.2)}
      />
      {stages.map(({ x, noise, d }, index) => (
        <g key={x}>
          <Arrow from={[x + 60, 70]} to={[x + 60, 100]} d={d - 0.1} accent />
          <Box x={x} y={100} w={120} h={36} d={d} label="denoise" />
          {index < stages.length - 1 && (
            <Arrow from={[x + 120, 118]} to={[x + 166, 118]} d={d + 0.4} />
          )}
          <Arrow from={[x + 60, 136]} to={[x + 60, 150]} d={d + 0.1} />
          <Frame x={x} y={150} noise={noise} d={d + 0.3} />
        </g>
      ))}
      <Label x={8} y={290} d={1.2}>
        DIFFUSION MODEL
      </Label>
      <Arrow from={[406, 270]} to={[406, 304]} d={3.3} />
      <Frame x={346} y={304} noise={0} d={3.6} />
      <text
        x={336}
        y={364}
        className={`${styles.accentText} ${styles.end} ${styles.fade}`}
        style={at(3.8)}
      >
        image
      </text>
      <g className={styles.fade} style={at(4)}>
        <text x={8} y={350} className={styles.text}>
          PhoBERT features join
        </text>
        <text x={8} y={372} className={styles.text}>
          every denoising stage
        </text>
      </g>
    </>
  )
}

function Sentiment() {
  const tokens = ['thầy', 'dạy', 'rất', 'dễ', 'hiểu']
  const classes = [
    { name: 'negative', width: 34, top: false },
    { name: 'neutral', width: 58, top: false },
    { name: 'positive', width: 280, top: true },
  ]
  return (
    <>
      {tokens.map((token, index) => (
        <Box
          key={token}
          x={8 + index * 94}
          y={6}
          w={88}
          h={36}
          d={0.1 + index * 0.12}
          label={token}
        />
      ))}
      <Arrow from={[118, 42]} to={[118, 80]} d={0.8} />
      <Arrow from={[362, 42]} to={[362, 80]} d={0.8} />
      <Box x={8} y={80} w={220} h={44} d={1.1} accent label="PhoBERT" />
      <Box x={252} y={80} w={220} h={44} d={1.3} label="Linguistic features" />
      <Arrow from={[118, 124]} to={[210, 164]} d={1.6} />
      <Arrow from={[362, 124]} to={[270, 164]} d={1.6} />
      <Box x={120} y={164} w={240} h={40} d={1.9} label="Classifier" />
      <Arrow from={[240, 204]} to={[240, 232]} d={2.2} />
      {classes.map(({ name, width, top }, index) => {
        const y = 238 + index * 28
        const d = 2.4 + index * 0.15
        return (
          <g key={name}>
            <text x={8} y={y + 9} className={`${styles.text} ${styles.fade}`} style={at(d)}>
              {name}
            </text>
            <rect
              x={100}
              y={y}
              width={width}
              height={18}
              className={`${top ? styles.accentFill : styles.mutedFill} ${styles.grow}`}
              style={at(d)}
            />
          </g>
        )
      })}
      <g className={styles.pop} style={at(3.3)}>
        <text x={8} y={352} className={styles.result}>
          F1 95.22%
        </text>
        <text x={8} y={382} className={styles.mutedText}>
          on the revised UIT-VSFC
        </text>
      </g>
    </>
  )
}

const SCENES: Record<SceneId, { Drawing: () => ReactNode; caption: string; alt: string }> = {
  companion: {
    Drawing: Companion,
    caption: 'Schematic: check the input, plan, answer, check the output.',
    alt: 'A user asks how much protein they have left. An input guardrail checks that the question is not harmful and rewrites the query if needed. The Planner also receives user behaviors. It breaks the question down, calls tools, observes the results, replanning if needed, and produces claims. The Answerer gathers those claims into a ledger, each traced to a source: profile, food log and guideline, and writes the result with a citation. An output guardrail checks that figures are sourced and the guideline is cited, then the final answer appears: 32 grams left, add protein at dinner.',
  },
  meals: {
    Drawing: Meals,
    caption: 'Schematic: example values, from calories left to meals that fit.',
    alt: 'The remaining calories are worked out from what the user has eaten. A user tower and a meal tower retrieve a few candidates from a grid of meal templates. Each portion is optimized to fit, LightGBM reranks the candidates, and the top meals are output with their portions.',
  },
  sdd: {
    Drawing: Sdd,
    caption: 'Schematic: task lists keep agents on track.',
    alt: 'A pipeline from Jira ticket to AI-written spec, task list, implementation and AI code review. Tasks are ticked one by one, then agent-driven end-to-end tests pass on web with Playwright and on mobile with Maestro.',
  },
  voice: {
    Drawing: Voice,
    caption: 'Schematic: "mì bò" is not instant noodles.',
    alt: 'A voice waveform becomes the Vietnamese transcript "một tô mì bò". An LLM turns it into a structured query with food, brand, alternative name, tag and grams. Search returns instant noodles first, and reranking on preparation state moves the cooked dish to the top. Recall at 3 is up 30 percentage points over keyword search alone.',
  },
  rag: {
    Drawing: Rag,
    caption: 'Schematic: from PDF to index to answer, on-premises.',
    alt: 'Inside an on-premises boundary, 2 GB of PDF manuals are parsed into Markdown and indexed. A question goes to a LangGraph workflow with a self-hosted LLM, which retrieves from the index and returns a command. Command lookup falls from about a minute searching PDFs to under 10 seconds, with 95 percent answer accuracy.',
  },
  'text-to-image': {
    Drawing: TextToImage,
    caption: 'Schematic: PhoBERT skip connections at every stage.',
    alt: 'A Vietnamese prompt, "mặt trời trên đồi", meaning sun over a hill, is encoded by PhoBERT, whose features enter the diffusion model through skip connections at each denoising stage. Frames resolve from pure noise into an image of a sun above a hill.',
  },
  sentiment: {
    Drawing: Sentiment,
    caption: 'Schematic: PhoBERT plus linguistic features.',
    alt: 'A Vietnamese sentence split into tokens goes into PhoBERT and into added linguistic features. Both feed a classifier that scores it negative, neutral or positive, reaching an F1 of 95.22 percent on the revised UIT-VSFC dataset.',
  },
}

export function ProjectScene({ id, active }: { id: SceneId; active: boolean }) {
  const { Drawing, caption, alt } = SCENES[id]
  return (
    <figure className={styles.scene} data-scene={id} data-active={active}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.drawing}
        role="img"
        aria-label={alt}
      >
        <Drawing />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  )
}
