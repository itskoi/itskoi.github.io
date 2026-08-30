import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const css = read('src/styles/global.css')

describe('global token contract', () => {
  describe('typography tokens + roles', () => {
    it('defines sans/mono stacks using the @fontsource family names — no serif', () => {
      expect(css).toMatch(/--font-sans:\s*"Geist Variable"/)
      expect(css).toMatch(/--font-mono:\s*"Geist Mono Variable"/)
      expect(css).not.toMatch(/--font-serif/)
    })

    it('defines the Swiss scale: poster display against a mono micro-label', () => {
      expect(css).toMatch(/--fs-display:\s*clamp\(3\.5rem, 13vw, 9\.5rem\)/)
      expect(css).toMatch(/--fs-h2:\s*clamp\(/)
      expect(css).toMatch(/--fs-h3:\s*clamp\(/)
      expect(css).toMatch(/--fs-body:\s*clamp\(/)
      expect(css).toMatch(/--fs-meta:\s*0\.8125rem/)
    })

    it('maps every heading to the grotesque (one type family carries the page)', () => {
      expect(css).toMatch(/h1,[\s\S]*?h2,[\s\S]*?h3,[\s\S]*?h4\s*\{[\s\S]*?var\(--font-sans\)/)
      expect(css).toMatch(/body\s*\{[\s\S]*?font-family:\s*var\(--font-sans\)/)
    })
  })

  describe('grid system', () => {
    it('defines grid tokens: 12 columns, gutter, margin', () => {
      expect(css).toMatch(/--grid-columns:\s*12/)
      expect(css).toMatch(/--grid-gutter:\s*clamp\(/)
      expect(css).toMatch(/--grid-margin:\s*clamp\(/)
    })

    it('drops to a 6-column grid on narrow screens', () => {
      expect(css).toMatch(/@media\s*\(max-width:\s*768px\)\s*\{[\s\S]*?--grid-columns:\s*6/)
    })

    it('exposes a shared .section-grid the sections snap to', () => {
      expect(css).toMatch(
        /\.section-grid\s*\{[\s\S]*?display:\s*grid[\s\S]*?repeat\(var\(--grid-columns\),\s*minmax\(0,\s*1fr\)\)/,
      )
    })
  })

  describe('flatness', () => {
    it('paints no gradients anywhere in global.css', () => {
      expect(css).not.toMatch(/gradient\(/)
    })

    it('keeps no rounded or translucent panels', () => {
      expect(css).not.toMatch(/border-radius/)
      expect(css).not.toMatch(/color-mix\(in srgb, var\(--color-surface\)/)
      expect(css).not.toMatch(/#experience/)
    })
  })

  describe('mono data-labels', () => {
    it('applies the mono face to date ranges, DOIs, and tech tag chips', () => {
      expect(read('src/sections/Experience/Experience.module.css')).toMatch(
        /\.period\s*\{[\s\S]*?font-family:\s*var\(--font-mono\)/,
      )
      expect(read('src/sections/Education/Education.module.css')).toMatch(
        /\.period\s*\{[\s\S]*?font-family:\s*var\(--font-mono\)/,
      )
      expect(read('src/sections/Technologies/Technologies.module.css')).toMatch(
        /\.tool\s*\{[\s\S]*?font-family:\s*var\(--font-mono\)/,
      )
      expect(read('src/sections/Publications/Publications.module.css')).toMatch(
        /\.doi\s*\{[\s\S]*?font-family:\s*var\(--font-mono\)/,
      )
    })
  })

  describe('links', () => {
    it('does not underline hyperlinks', () => {
      expect(css).toMatch(/a\s*\{[\s\S]*?text-decoration:\s*none/)
    })
  })

  describe('paper-default palette', () => {
    it('defines the light palette (paper + Swiss red) on :root', () => {
      expect(css).toMatch(/:root\s*\{[\s\S]*?--color-bg:\s*#ffffff/i)
      expect(css).toMatch(/--color-fg:\s*#0a0a0a/i)
      expect(css).toMatch(/--color-accent:\s*#e30613/i)
      expect(css).toMatch(/--color-accent-strong:\s*#c00016/i)
    })

    it('overrides every token under [data-theme="dark"] (the inverse poster mode)', () => {
      const darkBlock = css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)
      expect(darkBlock, '[data-theme="dark"] block must exist').toBeTruthy()
      const block = darkBlock?.[1] ?? ''
      for (const token of [
        '--color-bg',
        '--color-fg',
        '--color-fg-muted',
        '--color-border',
        '--color-accent',
        '--color-accent-strong',
        '--scene-figure',
        '--scene-figure-rgb',
        '--scene-piece-rgb',
      ]) {
        expect(block).toContain(token)
      }
    })

    it('follows the OS dark preference on first visit (no explicit data-theme)', () => {
      expect(css).toMatch(
        /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[\s\S]*?:root:not\(\[data-theme\]\)/,
      )
    })

    it('declares color-scheme for native controls', () => {
      expect(css).toMatch(/color-scheme:\s*(dark|light)/)
    })

    it('exposes the scene tokens for the 3D layer in both modes', () => {
      expect(css).toMatch(/--scene-figure:/)
      expect(css).toMatch(/--scene-figure-rgb:/)
      expect(css).toMatch(/--scene-piece-rgb:/)
    })
  })

  describe('dead tokens are gone', () => {
    it('drops the surface, backdrop-gradient, second accent, and serif tokens', () => {
      expect(css).not.toMatch(/--color-surface/)
      expect(css).not.toMatch(/--scene-backdrop/)
      expect(css).not.toMatch(/--color-accent-2/)
      expect(css).not.toMatch(/--font-serif/)
    })
  })
})
