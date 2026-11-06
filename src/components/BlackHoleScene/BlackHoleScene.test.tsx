import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BlackHoleScene } from './BlackHoleScene'

const source = readFileSync(
  resolve(process.cwd(), 'src/components/BlackHoleScene/BlackHoleScene.tsx'),
  'utf8',
)

describe('BlackHoleScene', () => {
  it('renders one decorative canvas, hidden from assistive tech (2D init is skipped under jsdom)', () => {
    const { container } = render(<BlackHoleScene />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('data-black-hole-canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes every color from the theme tokens', () => {
    expect(source).toMatch(/readSceneColors/)
    expect(source).toMatch(/--color-accent/)
    expect(source).toMatch(/color-mix/) // hot dots mix toward the scene ink
    expect(source).toMatch(/RING_INK/) // the ring's pink is a partial mix of the same two
    expect(source).not.toMatch(/['"`]#[0-9a-f]{3,8}/i)
  })

  it('rebuilds when the theme changes and stays behind the reduced-motion gate', () => {
    expect(source).toMatch(/\}, \[theme\]\)/)
    expect(source).toMatch(/prefersReducedMotion/)
  })
})
