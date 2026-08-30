import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FlowScene } from './FlowScene'

const source = readFileSync(
  resolve(process.cwd(), 'src/components/FlowScene/FlowScene.tsx'),
  'utf8',
)

describe('FlowScene', () => {
  it('renders a decorative canvas, hidden from assistive tech (2D init is skipped under jsdom)', () => {
    const { container } = render(<FlowScene />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas).toHaveAttribute('data-flow-canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('derives the streamline ink from the theme token (no hardcoded colors)', () => {
    expect(source).not.toMatch(/0x64ffda|0xb388ff|\bCYAN\b|\bVIOLET\b|#64ffda|#b388ff/)
    expect(source).toMatch(/readSceneColors/)
  })

  it('draws the two-ink specimen grammar: third-ink dashed lines, 0.75-ink obstacle ring', () => {
    expect(source).toMatch(/LINE_INK = 0\.3/)
    expect(source).toMatch(/RING_INK = 0\.75/)
    expect(source).toMatch(/FILL_INK = 0\.05/)
    expect(source).toMatch(/setLineDash\(\[4, 6\]\)/)
  })

  it('rebuilds when the theme changes', () => {
    expect(source).toMatch(/useTheme/)
    expect(source).toMatch(/\}, \[theme\]\)/)
  })

  it('drives the settle → shed → street → exit choreography off the scroll bands', () => {
    expect(source).toMatch(/getElementById\(id\)/)
    expect(source).toMatch(/topOf\('experience'\)/)
    expect(source).toMatch(/topOf\('education'\)/)
    expect(source).toMatch(/topOf\('publications'\)/)
    expect(source).toMatch(/flowTimeline/)
    expect(source).toMatch(/streetVortices/)
    expect(source).toMatch(/integrateStreamline/)
  })

  it('keeps all motion behind the reduced-motion gate (time and dash travel freeze)', () => {
    expect(source).toMatch(/if \(!reduce\)/)
  })

  it('is a 2D-canvas scene — three.js is gone', () => {
    expect(source).not.toMatch(/from 'three'/)
    expect(source).toMatch(/getContext\('2d'\)/)
  })
})
