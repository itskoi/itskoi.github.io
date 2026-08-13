import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChessScene } from './ChessScene'

const source = readFileSync(
  resolve(process.cwd(), 'src/components/ChessScene/ChessScene.tsx'),
  'utf8',
)

describe('ChessScene', () => {
  it('renders a decorative canvas (WebGL init is skipped under jsdom)', () => {
    const { container } = render(<ChessScene />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas).toHaveAttribute('data-chess-canvas')
  })

  it('derives piece color from the theme (no hardcoded neon)', () => {
    expect(source).not.toMatch(/0x64ffda|0xb388ff|\bCYAN\b|\bVIOLET\b|#64ffda|#b388ff/)
    expect(source).toMatch(/readPieceColors/)
    expect(source).toMatch(/figureHex/)
  })

  it('rebuilds when the theme changes', () => {
    expect(source).toMatch(/useTheme/)
    expect(source).toMatch(/\}, \[theme\]\)/)
  })

  it('builds the cube as a 4×4×4 lattice of small wireframe cubes', () => {
    expect(source).toMatch(/latticeHomes\(\)/)
    expect(source).toMatch(/smallCubeEdges/)
    expect(source).toMatch(/latticeGroup/)
  })

  it('drives the explode → gather → cube transition off the Education scroll band', () => {
    expect(source).toMatch(/getElementById\('education'\)/)
    expect(source).toMatch(/uTrans/)
    expect(source).toMatch(/explode/)
    expect(source).toMatch(/gather/)
    expect(source).toMatch(/cubeSpin/)
  })

  it('keeps all motion behind the reduced-motion gate', () => {
    expect(source).toMatch(/if \(!reduce\)/)
  })
})
