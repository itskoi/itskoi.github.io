import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LorenzScene } from './LorenzScene'

const source = readFileSync(
  resolve(process.cwd(), 'src/components/LorenzScene/LorenzScene.tsx'),
  'utf8',
)

describe('LorenzScene', () => {
  it('renders one decorative canvas, hidden from assistive tech (2D init is skipped under jsdom)', () => {
    const { container } = render(<LorenzScene />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('data-lorenz-canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes every color from the theme tokens', () => {
    expect(source).toMatch(/readSceneColors/)
    expect(source).toMatch(/--color-accent/)
    expect(source).not.toMatch(/['"`]#[0-9a-f]{3,8}/i)
  })

  it('rebuilds when the theme changes and stays behind the reduced-motion gate', () => {
    expect(source).toMatch(/\}, \[theme\]\)/)
    expect(source).toMatch(/prefersReducedMotion/)
  })
})
