import { type CSSProperties, memo } from 'react'

const SIZE = 12
// Each cloud's height and resting place as shares of the sky, its width in px, and seconds to cross.
const CLOUDS = [
  [3, 10, 150, 150],
  [11, 56, 100, 210],
  [16, 30, 120, 260],
  [7, 78, 84, 180],
]
const RUN = 140 // A cloud travels from 40% before the sky to its far edge, as styles.css has it.

// A disc of square pixels, less whatever falls inside a second disc `cut` pixels to its upper right.
function disc(cut = 0) {
  const c = SIZE / 2
  let d = ''
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const far = (dx: number, dy: number) => Math.hypot(x + 0.5 - c - dx, y + 0.5 - c - dy) > c
      if (!far(0, 0) && (!cut || far(cut, -cut / 2))) d += `M${x} ${y}h1v1h-1z`
    }
  }
  return d
}

const SUN = disc()
const MOON = disc(4)

export const Sky = memo(function Sky() {
  return (
    <>
      <div className="sky" aria-hidden="true">
        <svg
          className="sun"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          <path className="day" d={SUN} />
          <path className="night" d={MOON} />
        </svg>
      </div>
      {/* In front of the garden, so a cloud passes over the trees and never behind them. */}
      <div className="sky front" aria-hidden="true">
        {CLOUDS.map(([y, x, w, seconds]) => (
          <div
            key={y}
            className="life cloud"
            style={
              {
                '--y': `${y}%`,
                '--x': `${x}%`,
                '--w': `${w}px`,
                '--d': `${seconds}s`,
                // Starts each cloud at its resting place, where reduced motion leaves it.
                '--t': `${(-seconds * (x + 40)) / RUN}s`,
              } as CSSProperties
            }
          >
            <svg viewBox="0 0 32 12" aria-hidden="true">
              <rect x="2" y="6.5" width="28" height="5.5" rx="2.75" />
              <circle cx="9.5" cy="7" r="4" />
              <circle cx="16.5" cy="5.5" r="5.5" />
              <circle cx="23.5" cy="7.5" r="3.5" />
            </svg>
          </div>
        ))}
      </div>
    </>
  )
})
