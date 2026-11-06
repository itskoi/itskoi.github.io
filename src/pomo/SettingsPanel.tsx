import { useState } from 'react'
import { playEndSound } from './alert'
import { KINDS, type Kind } from './session'
import {
  END_SOUND_NAMES,
  END_SOUNDS,
  isValidMinutes,
  MAX_MINUTES,
  MIN_MINUTES,
  SCHEME_NAMES,
  SCHEMES,
  type Settings,
} from './settings'

function MinutesField(props: { kind: Kind; value: number; onChange: (minutes: number) => void }) {
  const { kind, value, onChange } = props
  // What is being typed, which may be briefly empty or out of range. Only valid values are kept.
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <label className="minutes">
      <span>{kind}</span>
      <input
        type="number"
        min={MIN_MINUTES}
        max={MAX_MINUTES}
        step={1}
        value={draft ?? value}
        aria-invalid={draft !== null && !isValidMinutes(Number(draft))}
        onChange={(ev) => {
          setDraft(ev.target.value)
          const minutes = Number(ev.target.value)
          if (isValidMinutes(minutes)) onChange(minutes)
        }}
        onBlur={() => setDraft(null)}
      />
      <span>min</span>
    </label>
  )
}

type Props = { settings: Settings; onChange: (settings: Settings) => void }

export function SettingsPanel({ settings, onChange }: Props) {
  return (
    <details className="settings">
      <summary>Settings</summary>
      <div className="settings-body">
        <div className="picker">
          <span className="label">Timers</span>
          {KINDS.map((kind) => (
            <MinutesField
              key={kind}
              kind={kind}
              value={settings.minutes[kind]}
              onChange={(minutes) =>
                onChange({ ...settings, minutes: { ...settings.minutes, [kind]: minutes } })
              }
            />
          ))}
          <p className="hint">Changes apply from the next session.</p>
        </div>

        <div className="picker">
          <span className="label" id="end-sound">
            Sound when a session ends
          </span>
          {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> would need its own reset styles for no benefit here */}
          <div className="chips" role="group" aria-labelledby="end-sound">
            {END_SOUNDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === settings.endSound}
                onClick={() => {
                  onChange({ ...settings, endSound: id })
                  playEndSound(id)
                }}
              >
                {END_SOUND_NAMES[id]}
              </button>
            ))}
          </div>
        </div>

        <div className="picker">
          <span className="label" id="scheme">
            Background
          </span>
          {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> would need its own reset styles for no benefit here */}
          <div className="chips" role="group" aria-labelledby="scheme">
            {SCHEMES.map((id) => (
              <button
                key={id}
                type="button"
                className="swatch"
                data-scheme={id}
                aria-pressed={id === settings.scheme}
                onClick={() => onChange({ ...settings, scheme: id })}
              >
                {SCHEME_NAMES[id]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </details>
  )
}
