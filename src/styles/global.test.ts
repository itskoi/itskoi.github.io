import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const css = read('src/styles/global.css')

describe('global token contract', () => {
  describe('typography tokens + roles', () => {
    it('defines serif/sans/mono stacks using the @fontsource family names', () => {
      expect(css).toMatch(/--font-serif:\s*"Fraunces Variable"/)
      expect(css).toMatch(/--font-sans:\s*"Geist Variable"/)
      expect(css).toMatch(/--font-mono:\s*"Geist Mono Variable"/)
    })

    it('defines a clamp-based type scale', () => {
      expect(css).toMatch(/--fs-display:\s*clamp\(/)
      expect(css).toMatch(/--fs-h2:\s*clamp\(/)
      expect(css).toMatch(/--fs-h3:\s*clamp\(/)
      expect(css).toMatch(/--fs-body:\s*clamp\(/)
    })

    it('maps headings to the serif and body to the sans', () => {
      expect(css).toMatch(/h1,[\s\S]*?h2,[\s\S]*?h3[\s\S]*?var\(--font-serif\)/)
      expect(css).toMatch(/body[\s\S]*?font-family:\s*var\(--font-sans\)/)
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

  describe('section panels', () => {
    it('wraps the content sections in a translucent rounded panel', () => {
      expect(css).toMatch(/#experience[\s\S]*?border-radius/)
      expect(css).toMatch(/color-mix\(in srgb, var\(--color-surface\) \d+%, transparent\)/)
    })
  })

  describe('dual light/dark palette', () => {
    it('defines the dark palette on :root', () => {
      expect(css).toMatch(/:root\s*\{[\s\S]*?--color-bg:/)
      expect(css).toMatch(/--color-accent:\s*#5ba4ff/i)
    })

    it('overrides every token under [data-theme="light"]', () => {
      const lightBlock = css.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/)
      expect(lightBlock, '[data-theme="light"] block must exist').toBeTruthy()
      const block = lightBlock?.[1] ?? ''
      for (const token of [
        '--color-bg',
        '--color-surface',
        '--color-fg',
        '--color-fg-muted',
        '--color-border',
        '--color-accent',
        '--color-accent-2',
        '--scene-figure',
        '--scene-figure-rgb',
        '--scene-piece-rgb',
        '--scene-backdrop',
      ]) {
        expect(block).toContain(token)
      }
    })

    it('follows the OS preference on first visit (no explicit data-theme)', () => {
      expect(css).toMatch(
        /@media\s*\(prefers-color-scheme:\s*light\)\s*\{[\s\S]*?:root:not\(\[data-theme\]\)/,
      )
    })

    it('drops the legacy cyan/violet accents', () => {
      expect(css).not.toMatch(/#64ffda|#b388ff|#2de2e6|#5eeedc/i)
    })

    it('declares color-scheme for native controls', () => {
      expect(css).toMatch(/color-scheme:\s*(dark|light)/)
    })

    it('exposes scene tokens for the canvas/3D layers in both modes', () => {
      expect(css).toMatch(/--scene-figure:/)
      expect(css).toMatch(/--scene-figure-rgb:/)
      expect(css).toMatch(/--scene-piece-rgb:/)
      expect(css).toMatch(/--scene-backdrop:/)
    })
  })
})
