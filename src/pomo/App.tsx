import { useEffect, useReducer, useState } from 'react'
import { alertSessionEnd, prepareAlerts } from './alert'
import { Sprites } from './art/Sprites'
import { SPECIES, STAGES } from './art/trees'
import { Garden } from './Garden'
import { SettingsPanel } from './SettingsPanel'
import {
  KINDS,
  type Kind,
  kindAt,
  nextKind,
  reducer,
  SPECIES_IDS,
  type Species,
  stageAt,
} from './session'
import { loadSettings, parseSettings, SETTINGS_KEY, saveSettings } from './settings'
import { KEY, load, parseState, save } from './storage'

const MINUTE = 60_000

function clock(ms: number) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`
}

function TreeScene({ species, stage }: { species: Species; stage: number }) {
  return (
    <svg
      className="tree-scene"
      viewBox="-78 -118 156 170"
      role="img"
      aria-label={`${SPECIES[species].name} tree at the ${STAGES[stage]} stage`}
    >
      <g className="island-shadow">
        <path d="M0 12L32 28L0 44L-32 28Z" style={{ fill: 'var(--cast)' }} opacity=".55" />
      </g>
      <g className="tree-float">
        <use href="#plot-1" />
        <use href={`#tree-${species}-${stage}`} />
      </g>
    </svg>
  )
}

export function App() {
  const [loaded] = useState(() => load(Date.now()))
  const [state, dispatch] = useReducer(reducer, loaded.state)
  const [saveProblem, setSaveProblem] = useState<string | null>(null)
  const [settings, setSettings] = useState(loadSettings)
  const [settingsProblem, setSettingsProblem] = useState<string | null>(null)
  const [picked, setPicked] = useState<Species | null>(null)
  const [pickedKind, setPickedKind] = useState<Kind | null>(null)
  const [viewGarden, setViewGarden] = useState(false)
  const [, redraw] = useReducer((n: number) => n + 1, 0)
  const { session, step } = state
  const endsAt = session?.endsAt
  const { endSound } = settings

  useEffect(() => setSaveProblem(save(state)), [state])
  // Every session opens on the garden (started here, resumed or from another tab), so a break can water it.
  useEffect(() => {
    if (endsAt !== undefined) setViewGarden(true)
  }, [endsAt])
  useEffect(() => setSettingsProblem(saveSettings(settings)), [settings])

  useEffect(() => {
    // Writing an identical value fires no event, so saving this state back cannot make tabs loop.
    const onStorage = (ev: StorageEvent) => {
      if (ev.newValue === null) return
      if (ev.key === SETTINGS_KEY) setSettings(parseSettings(ev.newValue))
      const next = ev.key === KEY ? parseState(ev.newValue) : null
      if (next) dispatch({ type: 'replace', state: next })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (endsAt === undefined) return
    const worker = new Worker(new URL('./ticker.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = () => {
      const now = Date.now()
      redraw()
      if (now < endsAt) return
      worker.onmessage = null // Ticks queued behind a blocking dialog must not alert again.
      dispatch({ type: 'finish', now })
      alertSessionEnd(nextKind(step), endSound)
    }
    return () => worker.terminate()
  }, [endsAt, step, endSound])

  const species = picked ?? state.lastSpecies
  const kind = session ? kindAt(step) : (pickedKind ?? kindAt(step))
  const now = Date.now()
  const duration = settings.minutes[kind] * MINUTE
  const time = clock(session ? session.endsAt - now : duration)
  const title = session ? `${time} ${kind} · Koidoro` : 'Koidoro'

  useEffect(() => {
    document.title = title
  }, [title])

  function startSession() {
    prepareAlerts()
    dispatch({ type: 'start', species, now: Date.now(), kind, duration })
    setPicked(null)
    setPickedKind(null)
  }

  function abandonSession() {
    const sure = window.confirm(
      'Abandon this session? Its tree stays in the garden but will never mature.',
    )
    if (sure) dispatch({ type: 'abandon', now: Date.now() })
  }

  const problems = new Set([loaded.problem, saveProblem, settingsProblem].filter((p) => p !== null))

  return (
    <main className="app" data-scheme={settings.scheme}>
      <Sprites />
      <aside className="sidebar">
        <h1>Koidoro</h1>
        {[...problems].map((problem) => (
          <p key={problem} className="notice" role="alert">
            {problem}
          </p>
        ))}
        {session ? (
          <h2>{kind}</h2>
        ) : (
          // biome-ignore lint/a11y/useSemanticElements: a <fieldset> would need its own reset styles for no benefit here
          <div className="chips" role="group" aria-label="Session type">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={k === kind}
                onClick={() => setPickedKind(k)}
              >
                {k}
              </button>
            ))}
          </div>
        )}
        <hr />

        {!session && kind === 'Work' && (
          <div className="picker">
            <span className="label" id="pick">
              Choose your tree, then start
            </span>
            {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> would need its own reset styles for no benefit here */}
            <div className="chips" role="group" aria-labelledby="pick">
              {SPECIES_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={id === species}
                  onClick={() => setPicked(id)}
                >
                  {SPECIES[id].name} · {SPECIES[id].en}
                </button>
              ))}
            </div>
            <p className="hint">{SPECIES[species].note}</p>
          </div>
        )}

        {!session && (
          <button type="button" className="primary" onClick={startSession}>
            Start {kind}
          </button>
        )}

        {session?.species && (
          <>
            <div className="tree-card">
              <TreeScene species={session.species} stage={stageAt(session, now)} />
            </div>
            <p className="hint">
              A tree only matures if the session runs to 00:00. Abandon it earlier and it stays at
              its current stage.
            </p>
            <button type="button" onClick={abandonSession}>
              Abandon
            </button>
          </>
        )}

        {session && !session.species && (
          <button type="button" onClick={() => dispatch({ type: 'endBreak' })}>
            End break
          </button>
        )}

        {session && !session.species && state.trees.length > 0 && (
          <p className="hint">
            Select a tree to water it. On a keyboard, tab into the garden, use the arrow keys to
            move between trees, and press Enter to water.
          </p>
        )}

        <button type="button" className="view-toggle" onClick={() => setViewGarden((v) => !v)}>
          {viewGarden ? 'View tree' : 'View garden'}
        </button>

        <SettingsPanel settings={settings} onChange={setSettings} />
      </aside>

      <div className="stage">
        <div className="count" role={session ? 'timer' : undefined}>
          {time}
        </div>
        {viewGarden ? (
          <Garden trees={state.trees} canWater={!!session && !session.species} />
        ) : session?.species ? (
          <TreeScene species={session.species} stage={stageAt(session, now)} />
        ) : kind === 'Work' ? (
          <TreeScene species={species} stage={0} />
        ) : (
          <p className="stage-note">Time for a {kind.toLowerCase()}. Your garden is waiting.</p>
        )}
      </div>
    </main>
  )
}
