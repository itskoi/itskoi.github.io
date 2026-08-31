import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DescentScene } from './DescentScene'

const source = readFileSync(
  resolve(process.cwd(), 'src/components/DescentScene/DescentScene.tsx'),
  'utf8',
)

describe('DescentScene', () => {
  it('renders a decorative canvas, hidden from assistive tech (2D init is skipped under jsdom)', () => {
    const { container } = render(<DescentScene />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas).toHaveAttribute('data-descent-canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('derives the ink from the theme token and the accent from --color-accent (no hardcoded colors)', () => {
    expect(source).toMatch(/readSceneColors/)
    expect(source).toMatch(/--color-accent/)
    expect(source).not.toMatch(/#e30613|#ff2b39|0x64ffda|#64ffda/)
  })

  it('draws the two-ink figure: quiet wireframe ground, third-ink dashes, accent specimen path', () => {
    expect(source).toMatch(/SURFACE_INK = 0\.22/)
    expect(source).toMatch(/FIELD_INK = 0\.3/)
    expect(source).toMatch(/PATH_AHEAD_INK = 0\.3/)
    expect(source).toMatch(/ACCENT_INK = 0\.75/)
    expect(source).toMatch(/\[3, 7\]/) // field dashes
    expect(source).toMatch(/\[2, 6\]/) // dotted path ahead
  })

  it('rides the trajectory: the scroll fraction drives the camera pose', () => {
    expect(source).toMatch(/window\.scrollY/)
    expect(source).toMatch(/scrollProgress/)
    expect(source).toMatch(/poseAt/)
    expect(source).toMatch(/buildTrajectory/)
  })

  it('keeps the field alive between scrolls — dash phase advances with the gradient magnitude', () => {
    expect(source).toMatch(/dashPhase\[k\] \+= speed \* step \* DASH_TRAVEL/)
  })

  it('caps every field streamline with a solid arrowhead — the quiver grammar states −∇f', () => {
    expect(source).toMatch(/const drawArrowhead/)
    expect(source).toMatch(/ARROW_SIZE = 0\.18/) // world units — arrows shrink with depth
    expect(source).toMatch(/drawArrowhead\(screen, style\)/)
    // sized by the foreshortening-free perspective scale, clamped to stay visible
    expect(source).toMatch(/projectionScale\(tip\.depth/)
    expect(source).toMatch(/Math\.min\(\s*Math\.max\(ARROW_SIZE/)
  })

  it('caps the traversed path with an accent arrowhead — the run states its heading', () => {
    expect(source).toMatch(/drawArrowhead\(behind\.screen, accent\(ACCENT_INK\), 1\.5\)/)
  })

  it('marks the minimum with an accent crosshair', () => {
    expect(source).toMatch(/crosshair the whole page descends toward/)
    expect(source).toMatch(/ctx\.arc/)
  })

  it('fades with depth and culls behind the camera (no fills, no shading)', () => {
    expect(source).toMatch(/depthFade/)
    expect(source).toMatch(/projectPoint/)
    expect(source).not.toMatch(/createRadialGradient|createLinearGradient|shadowBlur/)
  })

  it('rebuilds when the theme changes', () => {
    expect(source).toMatch(/useTheme/)
    expect(source).toMatch(/\}, \[theme\]\)/)
  })

  it('keeps all motion behind the reduced-motion gate — the canonical frame is mid-descent', () => {
    expect(source).toMatch(/if \(!reduce\)/)
    expect(source).toMatch(/REDUCED_S = 0\.5/)
  })

  it('is a 2D-canvas scene — three.js stays out', () => {
    expect(source).not.toMatch(/from 'three'/)
    expect(source).toMatch(/getContext\('2d'\)/)
  })
})
