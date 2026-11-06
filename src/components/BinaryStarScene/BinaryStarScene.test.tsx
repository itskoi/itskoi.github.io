import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BinaryStarScene } from './BinaryStarScene'

const source = readFileSync(
  resolve(process.cwd(), 'src/components/BinaryStarScene/BinaryStarScene.tsx'),
  'utf8',
)

describe('BinaryStarScene', () => {
  it('renders one decorative canvas, hidden from assistive tech (2D init is skipped under jsdom)', () => {
    const { container } = render(<BinaryStarScene />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('data-binary-star-canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes every color from the theme tokens', () => {
    expect(source).toMatch(/--color-accent/)
    expect(source).toMatch(/readSceneColors/)
    expect(source).not.toMatch(/['"`]#[0-9a-f]{3,8}/i)
  })

  it('draws the same star field as the black hole', () => {
    expect(source).toMatch(/starKind/)
  })

  it('rebuilds when the theme changes and stays behind the reduced-motion gate', () => {
    expect(source).toMatch(/\}, \[theme\]\)/)
    expect(source).toMatch(/prefersReducedMotion/)
  })
})
