import type { ReactNode } from 'react'
import type { SceneId } from '@/data/portfolio'
import {
  Arrow,
  at,
  Check,
  Chip,
  Cross,
  Encode,
  Frame,
  Label,
  Line,
  Rect,
  Retry,
  Strip,
  Wire,
} from './marks'
import styles from './ProjectScene.module.css'

// Drawn from the resume's own words (specs/project-io-scenes). Inputs and outputs are
// examples, which every caption states. Highlights quote docs/resume.tex.

export interface Step {
  title: string
  note?: string
  fail?: string // the step fails once with this reason, then is retried
  done?: false // a step with nothing to tick, such as starting from noise
  Draw: () => ReactNode // draws inside a 440 × 112 stage, at the origin
}

export interface Stepped {
  name: string
  input: readonly { label: string; lines: readonly string[]; wave?: boolean }[]
  steps: readonly Step[]
  output: { height: number; Draw: () => ReactNode } // draws inside a 464-wide box, at the origin
}

export interface Scene {
  stepped: Stepped
  caption: string
  alt: string
  highlights?: readonly (readonly [value: string, label: string, unit?: string])[]
  highlightNote?: string
}

const textOutput = (lines: readonly string[]): Stepped['output'] => ({
  height: 16 + lines.length * 20,
  Draw: () => (
    <>
      <Rect x={0} y={0} w={464} h={16 + lines.length * 20} d={0} />
      {lines.map((line, index) => (
        <Line key={line} x={12} y={18 + index * 20} text={line} d={0.15 + index * 0.1} />
      ))}
    </>
  ),
})

const companion: Stepped = {
  name: 'Wao Companion',
  input: [
    { label: 'USER TEXT', lines: ['“What should I eat tonight to hit my protein?”'] },
    { label: 'PROFILE', lines: ['goal −3 kg · protein target 90 g · eaten 58 g'] },
  ],
  steps: [
    {
      title: 'Input guardrail',
      note: 'safe, on-topic',
      Draw: () => (
        <>
          <Chip x={0} y={20} w={186} text="“What to eat tonight…”" d={0.15} />
          <Arrow from={[186, 33]} to={[220, 33]} d={0.35} />
          <Chip x={220} y={20} w={104} text="guardrail" d={0.55} accent />
          <Arrow from={[324, 33]} to={[358, 33]} d={0.75} />
          <Line x={366} y={33} text="safe" d={0.95} small />
          <Check x={410} y={33} d={1.05} />
          <Line x={0} y={74} text="~harmful or off-topic → rewrite or refuse" d={0.85} small />
        </>
      ),
    },
    {
      title: 'Break the task down',
      note: '3 sub-tasks',
      Draw: () => (
        <>
          <Chip x={0} y={43} w={156} text="tonight + protein" d={0.15} />
          {['How much protein left?', 'What fits at dinner?', 'Which guideline applies?'].map(
            (task, index) => {
              const y = 13 + index * 43
              return (
                <g key={task}>
                  <Wire path={`M156 56L232 ${y}`} d={0.4 + index * 0.1} />
                  <Chip x={236} y={y - 13} w={204} text={task} d={0.55 + index * 0.15} />
                </g>
              )
            },
          )}
        </>
      ),
    },
    {
      title: 'Look up profile, food log',
      note: 'target · eaten today',
      Draw: () =>
        [
          ['get_profile()', 'target {90 g}'],
          ['get_food_log(today)', 'eaten {58 g}'],
        ].map(([call, result], index) => {
          const y = 14 + index * 50
          const d = 0.15 + index * 0.45
          return (
            <g key={call}>
              <Chip x={0} y={y} w={200} text={call} d={d} />
              <Arrow from={[200, y + 13]} to={[240, y + 13]} d={d + 0.2} />
              <Line x={252} y={y + 13} text={result} d={d + 0.4} small />
              <Check x={410} y={y + 13} d={d + 0.5} />
            </g>
          )
        }),
    },
    {
      title: 'Fetch nutrition guideline',
      fail: 'timeout',
      Draw: () => (
        <>
          <Chip x={0} y={10} w={200} text="get_guideline(protein)" d={0.15} />
          <Arrow from={[200, 23]} to={[240, 23]} d={0.35} />
          <Line x={252} y={23} text="~timeout" d={0.55} small />
          <Cross x={330} y={23} d={0.65} />
          <Retry x={352} y={23} d={0.95} />
          <Line x={366} y={23} text="{retry}" d={1} small />
          <Chip x={0} y={62} w={200} text="get_guideline(protein)" d={1.15} />
          <Arrow from={[200, 75]} to={[240, 75]} d={1.35} />
          <Line x={252} y={75} text="guideline {[1]}" d={1.55} small />
          <Check x={410} y={75} d={1.65} />
        </>
      ),
    },
    {
      title: 'Gather claims',
      note: '3 claims, each sourced',
      Draw: () => (
        <>
          <Label x={0} y={6} d={0.15}>
            CLAIM
          </Label>
          <Label x={220} y={6} d={0.15}>
            SOURCE
          </Label>
          <Wire path="M0 16H440" d={0.15} />
          {[
            ['target 90 g', 'profile'],
            ['eaten 58 g', 'food log'],
            ['protein at dinner', 'guideline [1]'],
          ].map(([claim, source], index) => {
            const y = 34 + index * 26
            const d = 0.35 + index * 0.25
            return (
              <g key={claim}>
                <Line x={0} y={y} text={claim} d={d} small />
                <Line x={220} y={y} text={`~${source}`} d={d + 0.1} small />
                <Check x={410} y={y} d={d + 0.2} />
              </g>
            )
          })}
        </>
      ),
    },
    {
      title: 'Write the answer',
      Draw: () => (
        <>
          <Line x={0} y={10} text="90 − 58 = {32 g} left" d={0.15} small />
          <Rect x={0} y={30} w={440} h={64} d={0.45} />
          <Line x={12} y={50} text="You have {32 g} protein left today." d={0.65} small />
          <Line x={12} y={74} text="Try ~100 g grilled chicken. {[1]}" d={0.95} small />
          <rect
            x={262}
            y={66}
            width={8}
            height={16}
            className={`${styles.accentFill} ${styles.fade}`}
            style={at(1.15)}
          />
        </>
      ),
    },
    {
      title: 'Output guardrail',
      note: 'figures sourced, cited',
      Draw: () => (
        <>
          <Line x={0} y={10} text="You have {32 g} left … chicken. {[1]}" d={0.15} small />
          {[
            ['{32 g}', 'comes from a tool result'],
            ['{[1]}', 'cites the guideline'],
          ].map(([mark, why], index) => {
            const y = 48 + index * 36
            const d = 0.45 + index * 0.35
            return (
              <g key={why}>
                <Chip x={0} y={y - 13} w={70} text={mark} d={d} />
                <Arrow from={[70, y]} to={[104, y]} d={d + 0.15} />
                <Line x={116} y={y} text={why} d={d + 0.3} small />
                <Check x={410} y={y} d={d + 0.4} />
              </g>
            )
          })}
        </>
      ),
    },
  ],
  output: textOutput([
    'You have {32 g} protein left today.',
    'Try ~100 g grilled chicken breast',
    'with rice at dinner. {[1]}',
    '~[1] Wao protein guideline (nutritionist-approved)',
  ]),
}

const MEALS = [
  ['Cơm tấm gà', 620, '×1.0'],
  ['Phở bò', 540, '×1.2'],
  ['Gỏi cuốn', 330, '×1.5'],
] as const

const meals: Stepped = {
  name: 'Meal suggestions',
  input: [
    { label: 'TODAY', lines: ['1350 / 2000 kcal eaten · protein 58 / 90 g'] },
    { label: 'HABITS', lines: ['often eats phở, cơm tấm · allergy: shrimp'] },
  ],
  steps: [
    {
      title: 'Work out what is left',
      note: '650 kcal · 32 g protein',
      Draw: () =>
        (
          [
            ['CALORIES', 1350 / 2000, '~eaten 1350', '{650 kcal} left'],
            ['PROTEIN', 58 / 90, '~eaten 58 g', '{32 g} left'],
          ] as const
        ).map(([name, eaten, eatenText, leftText], index) => {
          const y = index * 56
          const d = 0.15 + index * 0.4
          return (
            <g key={name}>
              <Label x={0} y={y + 4} d={d}>
                {name}
              </Label>
              <rect
                x={0}
                y={y + 14}
                width={440 * eaten}
                height={14}
                className={`${styles.mutedFill} ${styles.grow}`}
                style={at(d + 0.1)}
              />
              <rect
                x={440 * eaten}
                y={y + 14}
                width={440 * (1 - eaten)}
                height={14}
                className={`${styles.accentFill} ${styles.grow}`}
                style={at(d + 0.4)}
              />
              <Line x={0} y={y + 40} text={eatenText} d={d + 0.2} small />
              <Line x={440} y={y + 40} text={leftText} d={d + 0.5} small anchor="end" />
            </g>
          )
        }),
    },
    {
      title: 'Find meals they would eat',
      note: '40 candidates',
      Draw: () => {
        const lit = new Set([3, 9, 20, 27, 37, 44])
        return (
          <>
            {Array.from({ length: 48 }, (_, index) => {
              const cx = 8 + (index % 16) * 28
              const cy = 10 + Math.floor(index / 16) * 22
              return lit.has(index) ? (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={5}
                  className={`${styles.accentFill} ${styles.pop}`}
                  style={at(0.75)}
                />
              ) : (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={5}
                  opacity={0.35}
                  className={`${styles.mutedFill} ${styles.fade}`}
                  style={at(0.15 + (index % 16) * 0.01)}
                />
              )
            })}
            <Line x={0} y={90} text="~match the user against every meal template" d={0.45} small />
            <Line x={440} y={90} text="{40 kept}" d={1.05} small anchor="end" />
          </>
        )
      },
    },
    {
      title: 'Fit each portion to the day',
      note: '×0.8 – ×1.5',
      Draw: () => (
        <>
          <path d="M300 0V96" className={`${styles.boundary} ${styles.fade}`} style={at(0.15)} />
          <Line x={306} y={4} text="~650 kcal" d={0.15} small />
          {MEALS.map(([name, kcal, portion], index) => {
            const y = 22 + index * 28
            const d = 0.35 + index * 0.2
            return (
              <g key={name}>
                <Line x={0} y={y} text={name} d={d} small />
                <rect
                  x={110}
                  y={y - 6}
                  width={(190 * kcal) / 650}
                  height={12}
                  className={`${styles.accentFill} ${styles.grow}`}
                  style={at(d + 0.1)}
                />
                <Line x={440} y={y} text={`~${portion} · ${kcal}`} d={d + 0.3} small anchor="end" />
              </g>
            )
          })}
        </>
      ),
    },
    {
      title: "Rank by what they'll accept",
      note: 'and keep eating',
      Draw: () => (
        <>
          <Label x={440} y={4} d={0.15} anchor="end">
            LIKELY TO LOG
          </Label>
          {(
            [
              ['Cơm tấm gà', 0.82, 2],
              ['Phở bò', 0.74, 0],
              ['Bún tôm', 0.61, 3],
              ['Gỏi cuốn', 0.55, 1],
            ] as const
          ).map(([name, score, from], rank) => {
            const y = 16 + rank * 24
            return (
              <g key={name} className={styles.pop} style={at(0.25)}>
                <g
                  className={styles.rerank}
                  style={at(0.75, { '--dy': `${(from - rank) * 24}px` })}
                >
                  <text x={0} y={y + 8} className={`${styles.text} ${styles.small}`}>
                    {name}
                  </text>
                  <rect
                    x={110}
                    y={y + 1}
                    width={280 * score}
                    height={14}
                    className={rank === 0 ? styles.accentFill : styles.mutedFill}
                  />
                  <text
                    x={440}
                    y={y + 8}
                    className={`${styles.mutedText} ${styles.small} ${styles.end}`}
                  >
                    {score.toFixed(2)}
                  </text>
                </g>
              </g>
            )
          })}
        </>
      ),
    },
    {
      title: 'Safety filter',
      note: '− bún tôm (shrimp)',
      Draw: () =>
        (
          [
            ['Cơm tấm gà', true],
            ['Phở bò', true],
            ['Bún tôm', false],
            ['Gỏi cuốn', true],
          ] as const
        ).map(([name, safe], index) => {
          const y = 10 + index * 26
          const d = 0.3 + index * 0.15
          return (
            <g key={name}>
              <Line x={0} y={y} text={name} d={d} small />
              {safe ? (
                <Check x={410} y={y} d={d + 0.2} />
              ) : (
                <>
                  <Wire path={`M-2 ${y}H62`} d={d + 0.5} accent />
                  <Cross x={414} y={y} d={d + 0.5} />
                  <Line x={396} y={y} text="{shrimp allergy}" d={d + 0.6} small anchor="end" />
                </>
              )}
            </g>
          )
        }),
    },
  ],
  output: {
    height: 66,
    Draw: () =>
      MEALS.map(([name, kcal, portion], index) => {
        const x = index * 158
        return (
          <g key={name} className={styles.pop} style={at(index * 0.15)}>
            <rect
              x={x}
              y={0}
              width={148}
              height={66}
              className={index === 0 ? styles.accentBox : styles.box}
            />
            <text x={x + 12} y={20} className={styles.text}>
              {name}
            </text>
            <text x={x + 12} y={46} className={`${styles.mutedText} ${styles.small}`}>
              {portion}
            </text>
            <text
              x={x + 136}
              y={46}
              className={`${styles.accentText} ${styles.small} ${styles.end}`}
            >
              {kcal} kcal
            </text>
          </g>
        )
      }),
  },
}

const TASKS = [
  'settings toggle',
  'time picker',
  'schedule job',
  'push payload',
  'skip if goal met',
  'tests',
]

// Six tasks in two columns; when `build` is set the agent ticks them off one by one.
function Tasks({ build }: { build?: boolean }) {
  return (
    <>
      {TASKS.map((task, index) => {
        const x = (index % 2) * 224
        const y = 14 + Math.floor(index / 2) * 36
        return (
          <g key={task}>
            <g
              className={build ? undefined : styles.pop}
              style={build ? undefined : at(0.15 + index * 0.12)}
            >
              <rect x={x} y={y - 8} width={16} height={16} className={styles.box} />
              <text x={x + 28} y={y} className={`${styles.text} ${styles.small}`}>
                {task}
              </text>
            </g>
            {build && <Check x={x + 1} y={y} d={0.35 + index * 0.12} />}
          </g>
        )
      })}
      {build && <Line x={440} y={108} text="{6 / 6 done}" d={1.1} small anchor="end" />}
    </>
  )
}

const sdd: Stepped = {
  name: 'Spec-driven workflow',
  input: [{ label: 'JIRA TICKET', lines: ['WAO-172 · Add a daily water reminder'] }],
  steps: [
    {
      title: 'AI writes the spec',
      note: 'spec.md',
      Draw: () => (
        <>
          <Chip x={0} y={40} w={100} text="WAO-172" d={0.15} />
          <Arrow from={[100, 53]} to={[140, 53]} d={0.35} />
          <Rect x={140} y={0} w={300} h={106} d={0.5} />
          <Label x={428} y={14} d={0.55} anchor="end">
            SPEC.MD
          </Label>
          {[
            '# Daily water reminder',
            '~- user picks a time',
            '~- notify once a day',
            '~- skip if goal is met',
          ].map((line, index) => (
            <Line
              key={line}
              x={152}
              y={22 + index * 22}
              text={line}
              d={0.65 + index * 0.15}
              small
            />
          ))}
        </>
      ),
    },
    { title: 'Split it into a task list', note: '6 tasks', Draw: () => <Tasks /> },
    { title: 'Agent builds task by task', note: '6 / 6 done', Draw: () => <Tasks build /> },
    {
      title: 'AI code review',
      note: '2 comments fixed',
      Draw: () => (
        <>
          <Rect x={0} y={0} w={240} h={106} d={0.15} />
          <g className={styles.fade} style={at(0.25)}>
            {[150, 110, 180, 90, 160, 120].map((width, index) => (
              <rect
                key={width}
                x={12 + (index % 3 === 1 ? 16 : 0)}
                y={12 + index * 15}
                width={width}
                height={6}
                className={index === 1 || index === 4 ? styles.accentFill : styles.mutedFill}
              />
            ))}
          </g>
          {(
            [
              ['handle timezones', 15],
              ['add a null check', 60],
            ] as const
          ).map(([comment, y], index) => {
            const d = 0.55 + index * 0.35
            return (
              <g key={comment}>
                <Wire path={`M214 ${y}L256 ${y}`} d={d} />
                <Chip x={256} y={y - 13} w={154} text={`“${comment}”`} d={d + 0.1} />
                <Check x={418} y={y} d={d + 0.6} />
              </g>
            )
          })}
        </>
      ),
    },
    {
      title: 'Agent-driven E2E tests',
      fail: '1 failing',
      Draw: () => (
        <>
          <Rect x={0} y={0} w={220} h={106} d={0.15} />
          <Wire path="M0 18H220" d={0.25} />
          <g className={styles.fade} style={at(0.25)}>
            {[10, 20, 30].map((cx) => (
              <circle key={cx} cx={cx} cy={9} r={2.5} className={styles.mutedFill} />
            ))}
          </g>
          <Line x={14} y={50} text="Web · Playwright" d={0.35} small />
          <Check x={180} y={50} d={0.65} />
          <Line x={14} y={80} text="~reminder shows" d={0.55} small />
          <Rect x={240} y={0} w={60} h={106} d={0.25} rx={10} />
          <Line x={312} y={22} text="Mobile · Maestro" d={0.45} small />
          <Line x={312} y={50} text="~1 failing" d={0.65} small />
          <Cross x={270} y={50} d={0.65} />
          <Retry x={270} y={80} d={1.15} />
          <Line x={312} y={80} text="{fix, re-run}" d={1.2} small />
          <Check x={404} y={80} d={1.65} />
        </>
      ),
    },
  ],
  output: {
    height: 82,
    Draw: () => (
      <>
        <Rect x={0} y={0} w={464} h={82} d={0} />
        <Line x={12} y={20} text="Merge request !1287 {merged}" d={0.15} />
        {(
          [
            ['Web · Playwright', 12],
            ['Mobile · Maestro', 236],
          ] as const
        ).map(([name, x], index) => {
          const d = 0.3 + index * 0.15
          return (
            <g key={name}>
              <g className={styles.pop} style={at(d)}>
                <rect x={x} y={38} width={216} height={32} className={styles.box} />
                <text x={x + 12} y={54} className={`${styles.text} ${styles.small}`}>
                  {name}
                </text>
              </g>
              <Check x={x + 190} y={54} d={d + 0.2} />
            </g>
          )
        })}
      </>
    ),
  },
}

const voice: Stepped = {
  name: 'Voice Log search',
  input: [
    {
      label: 'VOICE',
      wave: true,
      lines: ['“một tô mì bò với ly trà đá”', '~a bowl of beef noodles and an iced tea'],
    },
  ],
  steps: [
    {
      title: 'LLM turns speech into queries',
      note: '2 items',
      Draw: () => (
        <>
          <Chip x={0} y={40} w={226} text="“một tô mì bò với ly trà đá”" d={0.15} />
          <Wire path="M226 53L266 25" d={0.45} />
          <Wire path="M226 53L266 81" d={0.45} />
          <Chip x={266} y={12} w={174} text="food: {mì bò}" d={0.65} />
          <Chip x={266} y={68} w={174} text="food: {trà đá}" d={0.8} />
        </>
      ),
    },
    {
      title: 'Add alt names, tags, grams',
      note: 'cooked · 450 g',
      Draw: () => {
        let x = 0
        return (
          <>
            {(
              [
                ['FOOD', 'mì bò', 90],
                ['ALT NAME', 'mì thịt bò', 120],
                ['TAG', 'cooked', 98],
                ['GRAMS', '450', 108],
              ] as const
            ).map(([key, value, width], index) => {
              const d = 0.15 + index * 0.15
              const cx = x + width / 2
              const field = (
                <g key={key}>
                  <Rect x={x} y={8} w={width} h={54} d={d} />
                  <Label x={cx} y={24} d={d} anchor="middle">
                    {key}
                  </Label>
                  <Line x={cx} y={46} text={value} d={d + 0.1} small anchor="middle" />
                </g>
              )
              x += width + 8
              return field
            })}
            <Line x={0} y={90} text="~trà đá → 1 glass" d={0.95} small />
          </>
        )
      },
    },
    {
      title: 'Search food, recipe catalog',
      note: 'Typesense',
      Draw: () => (
        <>
          <Chip x={0} y={40} w={150} text="mì bò · cooked" d={0.15} />
          <Arrow from={[150, 53]} to={[190, 53]} d={0.35} />
          {[
            ['mì gói', 'instant'],
            ['mì bò', 'cooked'],
            ['bún bò', 'cooked'],
          ].map(([name, tag], index) => {
            const y = 2 + index * 36
            return (
              <g key={name} className={styles.pop} style={at(0.55 + index * 0.12)}>
                <rect x={190} y={y} width={250} height={30} className={styles.box} />
                <text x={202} y={y + 15} className={`${styles.text} ${styles.small}`}>
                  {name}
                </text>
                <text
                  x={428}
                  y={y + 15}
                  className={`${styles.mutedText} ${styles.small} ${styles.end}`}
                >
                  {tag}
                </text>
              </g>
            )
          })}
        </>
      ),
    },
    {
      title: 'Rerank on prep state, brand',
      note: 'mì gói ↓ mì bò ↑',
      Draw: () =>
        (
          [
            ['mì bò', 'cooked · matches', 1],
            ['bún bò', 'cooked', 2],
            ['mì gói', 'instant · demoted', 0],
          ] as const
        ).map(([name, tag, from], rank) => {
          const y = 2 + rank * 36
          return (
            <g key={name} className={styles.pop} style={at(0.15)}>
              <g className={styles.rerank} style={at(0.65, { '--dy': `${(from - rank) * 36}px` })}>
                <rect
                  x={0}
                  y={y}
                  width={440}
                  height={30}
                  className={rank === 0 ? styles.accentBox : styles.box}
                />
                <text x={12} y={y + 15} className={`${styles.text} ${styles.small}`}>
                  {name}
                </text>
                <text
                  x={428}
                  y={y + 15}
                  className={`${styles.mutedText} ${styles.small} ${styles.end}`}
                >
                  {tag}
                </text>
              </g>
            </g>
          )
        }),
    },
  ],
  output: {
    height: 74,
    Draw: () =>
      [
        ['Mì bò (cooked)', '1 bowl · 450 g'],
        ['Trà đá', '1 glass'],
      ].map(([name, amount], index) => {
        const y = index * 40
        return (
          <g key={name} className={styles.pop} style={at(index * 0.15)}>
            <rect
              x={0}
              y={y}
              width={464}
              height={34}
              className={index === 0 ? styles.accentBox : styles.box}
            />
            <text x={12} y={y + 17} className={styles.text}>
              {name}
            </text>
            <text x={452} y={y + 17} className={`${styles.mutedText} ${styles.end}`}>
              {amount}
            </text>
          </g>
        )
      }),
  },
}

const HITS = new Set([5, 14, 19])

const rag: Stepped = {
  name: 'SoC docs chatbot · on-premises',
  input: [{ label: 'ENGINEER', lines: ['“Which command sets a 10 ns clock on clk?”'] }],
  steps: [
    {
      title: 'Search the indexed manuals',
      note: '~2 GB, as Markdown',
      Draw: () => (
        <>
          <Rect x={8} y={18} w={44} h={58} d={0.15} />
          <Rect x={0} y={26} w={44} h={58} d={0.25} />
          <Line x={0} y={100} text="~PDF ~2 GB" d={0.25} small />
          <Arrow from={[56, 52]} to={[90, 52]} d={0.4} />
          <Chip x={90} y={39} w={104} text="## Markdown" d={0.55} />
          <Arrow from={[194, 52]} to={[228, 52]} d={0.7} />
          {Array.from({ length: 32 }, (_, index) => {
            const x = 236 + (index % 8) * 26
            const y = 14 + Math.floor(index / 8) * 20
            const hit = HITS.has(index)
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={20}
                height={14}
                className={
                  hit ? `${styles.accentFill} ${styles.pop}` : `${styles.box} ${styles.fade}`
                }
                style={at(hit ? 1.15 : 0.85)}
              />
            )
          })}
          <Line x={236} y={100} text="~index → {3 hits}" d={1.25} small />
        </>
      ),
    },
    {
      title: 'Pick the relevant passages',
      note: 'top 3',
      Draw: () =>
        [
          ['§4.2', 'create_clock -period <ns>'],
          ['§4.3', 'set_clock_groups'],
          ['§7.1', 'get_ports <name>'],
        ].map(([section, passage], index) => {
          const y = 4 + index * 36
          const d = 0.15 + index * 0.2
          return (
            <g key={section}>
              <g className={styles.pop} style={at(d)}>
                <rect
                  x={0}
                  y={y}
                  width={440}
                  height={30}
                  className={index === 0 ? styles.accentBox : styles.box}
                />
                <text x={12} y={y + 15} className={`${styles.mutedText} ${styles.small}`}>
                  {section}
                </text>
                <text x={64} y={y + 15} className={`${styles.text} ${styles.small}`}>
                  {passage}
                </text>
              </g>
              <Check x={410} y={y + 15} d={d + 0.3} />
            </g>
          )
        }),
    },
    {
      title: 'Self-hosted LLM answers',
      note: 'no data leaves',
      Draw: () => (
        <>
          <rect
            x={0}
            y={0}
            width={440}
            height={108}
            className={`${styles.boundary} ${styles.fade}`}
            style={at(0.15)}
          />
          <Label x={10} y={14} d={0.15}>
            ON-PREMISES
          </Label>
          <g className={styles.fade} style={at(0.3)}>
            {[70, 56, 42].map((width, index) => (
              <rect
                key={width}
                x={12}
                y={34 + index * 18}
                width={width}
                height={8}
                className={styles.mutedFill}
              />
            ))}
          </g>
          <Arrow from={[90, 52]} to={[124, 52]} d={0.55} />
          <Chip x={124} y={34} w={120} h={36} text="LLM · vLLM" d={0.7} accent />
          <Arrow from={[244, 52]} to={[278, 52]} d={0.95} />
          <Line x={286} y={44} text="{create_clock}" d={1.15} small />
          <Line x={286} y={64} text="{-period 10 …}" d={1.25} small />
        </>
      ),
    },
  ],
  output: textOutput([
    '{create_clock -period 10 [get_ports clk]}',
    '~Source: timing constraints manual, §4.2',
  ]),
}

const textToImage: Stepped = {
  name: 'Text-to-image model',
  input: [{ label: 'PROMPT', lines: ['“mặt trời trên đồi”', '~sun over a hill'] }],
  steps: [
    {
      title: 'PhoBERT reads the prompt',
      note: 'Vietnamese encoder',
      Draw: () => (
        <Encode
          tokens={[
            ['mặt trời', 110],
            ['trên', 70],
            ['đồi', 66],
          ]}
        />
      ),
    },
    {
      title: 'Start from pure noise',
      done: false,
      Draw: () => (
        <>
          <Frame x={0} y={4} cell={8} noise={1} d={0.15} />
          <Line x={120} y={40} text="~random pixels," d={0.45} small />
          <Line x={120} y={60} text="~the size of the image" d={0.55} small />
        </>
      ),
    },
    {
      title: 'Denoise step by step',
      note: 'text joins every stage',
      Draw: () => (
        <>
          <Strip x={0} y={0} d={0.15} cell={22} />
          {[0.66, 0.33, 0].map((noise, index) => {
            const x = index * 160
            const d = 0.35 + index * 0.35
            return (
              <g key={noise}>
                <Wire path={`M${x + 42} 18V30`} d={d} accent />
                <Frame x={x} y={32} cell={7} noise={noise} d={d + 0.1} />
                {index < 2 && <Arrow from={[x + 92, 74]} to={[x + 152, 74]} d={d + 0.2} />}
              </g>
            )
          })}
        </>
      ),
    },
  ],
  output: {
    height: 96,
    Draw: () => (
      <>
        <Frame x={0} y={0} cell={8} noise={0} d={0} />
        <Line x={116} y={36} text="“mặt trời trên đồi”" d={0.2} />
        <Line x={116} y={58} text="~a sun over a hill" d={0.3} />
      </>
    ),
  },
}

const sentiment: Stepped = {
  name: 'Sentiment model',
  input: [
    {
      label: 'STUDENT FEEDBACK',
      lines: ['“thầy dạy rất dễ hiểu”', '~the teacher explains very clearly'],
    },
  ],
  steps: [
    {
      title: 'PhoBERT reads the sentence',
      Draw: () => (
        <Encode
          tokens={[
            ['thầy', 82],
            ['dạy', 82],
            ['rất', 82],
            ['dễ', 82],
            ['hiểu', 82],
          ]}
        />
      ),
    },
    {
      title: 'Add linguistic features',
      Draw: () => (
        <>
          {[
            ['thầy', 'noun'],
            ['dạy', 'verb'],
            ['rất', 'intensifier'],
            ['dễ', 'adjective'],
            ['hiểu', 'verb'],
          ].map(([token, tag], index) => {
            const x = index * 89
            const d = 0.15 + index * 0.12
            const key = index === 2 || index === 3
            return (
              <g key={token}>
                <Chip x={x} y={10} w={82} text={token} d={d} accent={key} />
                <Wire path={`M${x + 41} 36V52`} d={d + 0.2} />
                <Line
                  x={x + 41}
                  y={64}
                  text={key ? `{${tag}}` : `~${tag}`}
                  d={d + 0.3}
                  small
                  anchor="middle"
                />
              </g>
            )
          })}
          <Line x={0} y={98} text="“rất” strengthens “dễ hiểu”" d={1.05} small />
        </>
      ),
    },
    {
      title: 'Classify',
      note: '3 classes',
      Draw: () => (
        <>
          <Chip x={0} y={10} w={180} text="PhoBERT features" d={0.15} />
          <Chip x={0} y={70} w={180} text="linguistic features" d={0.25} />
          <Wire path="M180 23L210 53" d={0.45} />
          <Wire path="M180 83L210 53" d={0.45} />
          <Chip x={210} y={38} w={100} h={30} text="classifier" d={0.65} accent />
          <Wire path="M310 53H330" d={0.85} />
          {(
            [
              ['neg', 10],
              ['neu', 18],
              ['pos', 64],
            ] as const
          ).map(([name, width], index) => {
            const y = 22 + index * 26
            const d = 0.95 + index * 0.12
            return (
              <g key={name}>
                <Line x={336} y={y + 7} text={`~${name}`} d={d} small />
                <rect
                  x={370}
                  y={y}
                  width={width}
                  height={14}
                  className={`${index === 2 ? styles.accentFill : styles.mutedFill} ${styles.grow}`}
                  style={at(d)}
                />
              </g>
            )
          })}
        </>
      ),
    },
  ],
  output: {
    height: 64,
    Draw: () => (
      <>
        <Rect x={0} y={0} w={464} h={64} d={0} />
        <Line x={12} y={22} text="“thầy dạy rất dễ hiểu”" d={0.15} />
        <Line x={12} y={44} text="~the teacher explains very clearly" d={0.2} />
        <text
          x={452}
          y={33}
          className={`${styles.big} ${styles.end} ${styles.pop}`}
          style={at(0.4)}
        >
          Positive
        </text>
      </>
    ),
  },
}

export const SCENES: Record<SceneId, Scene> = {
  companion: {
    stepped: companion,
    caption: 'Schematic: example values, 90 − 58 = 32 g protein left.',
    alt: 'A user asks what to eat tonight to hit their protein, with a profile: target 90 grams, eaten 58. Inside Wao Companion each step plays in turn: the input guardrail passes the question, the task is broken into 3 sub-questions, tools look up the profile and food log, fetching the guideline times out and is retried, claims are gathered into a ledger with sources, the answer is drafted and the output guardrail checks every figure and citation. Output: 32 grams left, try about 100 grams of grilled chicken at dinner, citing the Wao protein guideline.',
    highlights: [
      ['93%', 'right call'],
      ['92%', 'factually correct'],
      ['89%', 'grounded in data'],
    ],
  },
  meals: {
    stepped: meals,
    caption: 'Schematic: example values, every suggestion fits the 650 kcal left.',
    alt: 'Input: 1350 of 2000 kcal eaten, protein 58 of 90 grams, often eats phở and cơm tấm, allergic to shrimp. Each step plays in turn: bars show 650 kcal and 32 grams of protein left, likely meals light up from a grid of templates, portions are scaled to fit 650 kcal, the meals are reranked by how likely the user is to log them, and the safety filter strikes out bún tôm for the shrimp allergy. Output: cơm tấm gà, phở bò and gỏi cuốn with portions and calories.',
    highlights: [
      ['+59%', 'new-meal recall'],
      ['+13%', 'accept rate'],
    ],
    highlightNote: 'offline, simulated users',
  },
  sdd: {
    stepped: sdd,
    caption: 'Schematic: example ticket, task lists keep the agent on track.',
    alt: 'Input: Jira ticket WAO-172, add a daily water reminder. Each step plays in turn: AI writes spec.md, the spec is split into 6 tasks, the agent ticks them off one by one, AI code review leaves 2 comments that get fixed, and agent-driven E2E passes on web while 1 mobile test fails, is fixed and re-run, and passes. Output: the merge request is merged with web and mobile checks green.',
    highlights: [
      [
        'More reliable & autonomous',
        'specs keep context · dev loop: code + test + review · self-checked by agent E2E',
      ],
    ],
  },
  voice: {
    stepped: voice,
    caption: 'Schematic: example transcript, "mì bò" finds the cooked dish, not instant noodles.',
    alt: 'Input: a voice clip, “một tô mì bò với ly trà đá”, a bowl of beef noodles and an iced tea. Each step plays in turn: the LLM splits the transcript into two food queries, adds an alternative name, the cooked tag and 450 grams, the catalog search returns instant noodles first, and reranking on preparation state moves the cooked dish to the top. Output: two food log entries, mì bò cooked, 1 bowl, 450 grams, and trà đá, 1 glass.',
    highlights: [['+30%', 'recall@3 vs keyword', 'points']],
  },
  rag: {
    stepped: rag,
    caption: 'Schematic: example command, ask for a command instead of searching PDFs.',
    alt: 'Input: an engineer asks which command sets a 10 nanosecond clock on clk. Each step plays in turn: 2 GB of PDF manuals, parsed to Markdown and indexed, return 3 hits; the top 3 passages are picked; a self-hosted LLM inside the on-premises boundary writes the command. Output: create_clock -period 10 [get_ports clk], with its source manual.',
    highlights: [
      ['<10 s', 'lookup, was ~1 min'],
      ['95%', 'answer accuracy'],
    ],
  },
  'text-to-image': {
    stepped: textToImage,
    caption: 'Schematic: PhoBERT features join every denoising stage.',
    alt: 'Input: the Vietnamese prompt “mặt trời trên đồi”, sun over a hill. Each step plays in turn: PhoBERT turns the tokens into sentence features, the model starts from a frame of pure noise, and the frame is denoised in stages with the text features joining each one. Output: an image of a sun above a hill.',
  },
  sentiment: {
    stepped: sentiment,
    caption: 'Schematic: example sentence, PhoBERT plus linguistic features.',
    alt: 'Input: student feedback “thầy dạy rất dễ hiểu”, the teacher explains very clearly. Each step plays in turn: PhoBERT turns the tokens into sentence features, linguistic features tag each word and mark “rất” as an intensifier, and a classifier combines both and scores positive highest. Output: positive.',
    highlights: [['95.22%', 'F1, UIT-VSFC']],
  },
}
