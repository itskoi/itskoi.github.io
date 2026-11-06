import { useEffect, useState } from 'react'
import type { SceneId } from '@/data/portfolio'
import { prefersReducedMotion } from '@/lib/gsap'
import { Arrow, at, Check, Cross, Label, Line, Retry, Wave } from './marks'
import styles from './ProjectScene.module.css'
import { SCENES, type Step, type Stepped } from './scenes'

const WIDTH = 480
const INPUT_SECONDS = 1.1
const stepSeconds = (step: Step) => (step.fail ? 2.2 : 1.6)

// Index -1 is the input, 0…n-1 the steps, n the result.
function SteppedDrawing({ scene, index, alt }: { scene: Stepped; index: number; alt: string }) {
  const { name, input, steps, output } = scene
  const last = steps.length
  const inputHeight =
    input.reduce((sum, block) => sum + 20 + (block.wave ? 30 : 0) + block.lines.length * 20, 0) + 12
  const boxY = 20 + inputHeight + 18
  const boxHeight = Math.max(40 + last * 24, 182)
  const outputY = boxY + boxHeight + 38
  const height = outputY + output.height + 4

  let y = 36
  const inputRows = input.flatMap((block, b) => {
    const d = 0.2 + b * 0.15
    const rows = [
      <Label key={block.label} x={20} y={y} d={d}>
        {block.label}
      </Label>,
    ]
    y += 20
    if (block.wave) {
      rows.push(<Wave key="wave" x={20} y={y + 4} d={d} />)
      y += 30
    }
    for (const line of block.lines) {
      rows.push(<Line key={line} x={20} y={y} text={line} d={d + 0.1} />)
      y += 20
    }
    return rows
  })

  const step = steps[index]
  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} className={styles.drawing} role="img" aria-label={alt}>
      <Label x={8} y={10} d={0.05}>
        INPUT
      </Label>
      <rect
        x={8}
        y={20}
        width={464}
        height={inputHeight}
        className={`${styles.box} ${styles.pop}`}
        style={at(0.1)}
      />
      {inputRows}
      <Arrow from={[240, 20 + inputHeight]} to={[240, boxY]} d={0.6} />
      <rect
        x={8}
        y={boxY}
        width={464}
        height={boxHeight}
        className={`${styles.accentBox} ${styles.pop}`}
        style={at(0.8)}
      />
      <text
        x={20}
        y={boxY + 18}
        className={`${styles.stepLabel} ${styles.strong} ${styles.fade}`}
        style={at(0.9)}
      >
        {name.toUpperCase()}
      </text>

      {step && (
        <g key={index}>
          <text x={20} y={boxY + 42} className={`${styles.stepLabel} ${styles.fade}`} style={at(0)}>
            STEP {index + 1} / {last} · {step.title.toUpperCase()}
          </text>
          <g transform={`translate(20 ${boxY + 60})`}>
            <step.Draw />
          </g>
        </g>
      )}

      {index >= last && (
        <g>
          {steps.map(({ title, note, fail, done }, i) => {
            const rowY = boxY + 40 + i * 24
            const d = i * 0.06
            return (
              <g key={title}>
                <g className={styles.fade} style={at(d)}>
                  <text x={22} y={rowY} className={styles.label}>
                    {i + 1}
                  </text>
                  <text x={42} y={rowY} className={`${styles.text} ${styles.small}`}>
                    {title}
                  </text>
                  {(note ?? fail) && (
                    <text
                      x={fail ? 398 : 438}
                      y={rowY}
                      className={`${styles.mutedText} ${styles.small} ${styles.end}`}
                    >
                      {note ?? fail}
                    </text>
                  )}
                </g>
                {fail && (
                  <>
                    <Cross x={408} y={rowY} d={d} />
                    <Retry x={428} y={rowY} d={d} />
                  </>
                )}
                {done !== false && <Check x={446} y={rowY} d={d + 0.1} />}
              </g>
            )
          })}
          <Arrow from={[240, boxY + boxHeight]} to={[240, boxY + boxHeight + 18]} d={0.5} />
          <Label x={8} y={outputY - 10} d={0.6}>
            OUTPUT
          </Label>
          <g transform={`translate(8 ${outputY})`} className={styles.fade} style={at(0.7)}>
            <output.Draw />
          </g>
        </g>
      )}
    </svg>
  )
}

function Stepper({ scene, active, alt }: { scene: Stepped; active: boolean; alt: string }) {
  const last = scene.steps.length
  const [index, setIndex] = useState(-1)
  const [paused, setPaused] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => {
    if (!active) return
    const reduced = prefersReducedMotion()
    setStill(reduced)
    setIndex(reduced ? last : -1)
    setPaused(false)
  }, [active, last])

  useEffect(() => {
    if (!active || paused || still || index >= last) return
    const seconds = index < 0 ? INPUT_SECONDS : stepSeconds(scene.steps[index])
    const timer = setTimeout(() => setIndex(index + 1), seconds * 1000)
    return () => clearTimeout(timer)
  }, [active, paused, still, index, last, scene])

  const where = index < 0 ? 'Input' : index >= last ? 'Result' : `Step ${index + 1} / ${last}`
  return (
    <>
      <SteppedDrawing scene={scene} index={index} alt={alt} />
      <div className={styles.controls}>
        <button type="button" onClick={() => setIndex(Math.max(-1, index - 1))}>
          Back
        </button>
        {!still && (
          <button type="button" onClick={() => setPaused(!paused)}>
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
        <button type="button" onClick={() => setIndex(Math.min(last, index + 1))}>
          Next
        </button>
        <span role="status" className={styles.where}>
          {where}
        </span>
      </div>
    </>
  )
}

export function ProjectScene({ id, active }: { id: SceneId; active: boolean }) {
  const { stepped, caption, alt, highlights, highlightNote } = SCENES[id]
  return (
    <figure className={styles.scene} data-scene={id} data-active={active}>
      <Stepper scene={stepped} active={active} alt={alt} />
      {highlights && (
        <div className={styles.highlights}>
          <ul>
            {highlights.map(([value, label, unit]) => (
              <li key={label}>
                <strong>
                  {value}
                  {unit && <small> {unit}</small>}
                </strong>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          {highlightNote && <p>{highlightNote}</p>}
        </div>
      )}
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  )
}
