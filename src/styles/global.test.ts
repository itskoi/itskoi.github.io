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

    it('caps content to a centered measure on wide displays (padding, not max-width)', () => {
      expect(css).toMatch(/--grid-max-width:\s*80rem/)
      expect(css).toMatch(
        /--grid-inline:\s*max\(var\(--grid-margin\),\s*calc\(\(100% - var\(--grid-max-width\)\) \/ 2\)\)/,
      )
      expect(css).toMatch(/\.section-grid\s*\{[\s\S]*?padding-inline:\s*var\(--grid-inline\)/)
    })

    it('aligns the nav chrome to the same measure', () => {
      expect(read('src/components/Nav/Nav.module.css')).toMatch(/padding:[^;]*var\(--grid-inline\)/)
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

  describe('chrome: hero poster + nav bar', () => {
    const heroCss = read('src/sections/Hero/Hero.module.css')
    const heroTsx = read('src/sections/Hero/Hero.tsx')
    const navCss = read('src/components/Nav/Nav.module.css')
    const toggleCss = read('src/components/ThemeToggle/ThemeToggle.module.css')

    it('hero is flush-left and bottom-anchored on the grid', () => {
      expect(heroCss).toMatch(/\.hero\s*\{[\s\S]*?text-align:\s*left/)
      expect(heroCss).toMatch(/align-content:\s*end/)
      expect(heroCss).not.toMatch(/text-align:\s*center/)
    })

    it('hero name carries the poster display treatment (scale + tight tracking)', () => {
      expect(heroCss).toMatch(
        /\.name\s*\{[\s\S]*?var\(--fs-display\)[\s\S]*?letter-spacing:\s*-0\.045em/,
      )
      expect(heroCss).toMatch(/line-height:\s*1;/)
    })

    it('hero meta (location + links) is mono; the specimen label is gone', () => {
      expect(heroCss).toMatch(/\.meta\s*\{[\s\S]*?var\(--font-mono\)/)
      expect(heroCss).not.toMatch(/\.caption/)
      expect(heroTsx).not.toMatch(/FIG\. 1/)
    })

    it('nav is a fixed top bar with mono uppercase labels', () => {
      expect(navCss).toMatch(/\.nav\s*\{[\s\S]*?position:\s*fixed[\s\S]*?top:\s*0/)
      expect(navCss).toMatch(/border-bottom:\s*1px solid var\(--color-border\)/)
      expect(navCss).toMatch(
        /\.link\s*\{[\s\S]*?var\(--font-mono\)[\s\S]*?text-transform:\s*uppercase/,
      )
    })

    it('chrome carries no rounded corners and no gradients', () => {
      for (const sheet of [heroCss, navCss, toggleCss]) {
        expect(sheet).not.toMatch(/border-radius/)
        expect(sheet).not.toMatch(/gradient\(/)
      }
    })
  })

  describe('sections snap to the grid', () => {
    const sectionSheets = [
      'src/sections/Experience/Experience.module.css',
      'src/sections/Education/Education.module.css',
      'src/sections/Publications/Publications.module.css',
      'src/sections/Technologies/Technologies.module.css',
    ].map(read)

    it('every content section places its heading in columns 1–4', () => {
      for (const sheet of sectionSheets) {
        expect(sheet).toMatch(/\.heading\s*\{[^}]*grid-column:\s*1\s*\/\s*5/)
      }
    })

    it('every tabular row re-declares the grid columns', () => {
      for (const sheet of sectionSheets) {
        expect(sheet).toMatch(/repeat\(var\(--grid-columns\),\s*minmax\(0,\s*1fr\)\)/)
      }
    })

    it('every section is separated by a hairline rule, not a panel', () => {
      for (const sheet of sectionSheets) {
        expect(sheet).toMatch(/border-top:\s*1px solid var\(--color-border\)/)
        expect(sheet).not.toMatch(/border-radius/)
        expect(sheet).not.toMatch(/color-mix\(in srgb, var\(--color-surface\)/)
      }
    })

    it('the Experience rows place period / role / highlights in the index, left, and right fields', () => {
      const sheet = sectionSheets[0]
      expect(sheet).toMatch(/\.period\s*\{[^}]*grid-column:\s*1\s*\/\s*3/)
      expect(sheet).toMatch(/\.entryHeader\s*\{[^}]*grid-column:\s*3\s*\/\s*7/)
      expect(sheet).toMatch(/\.highlights\s*\{[^}]*grid-column:\s*7\s*\/\s*13/)
    })
  })

  describe('section heading accent', () => {
    const sheets = [
      'src/sections/Experience/Experience.module.css',
      'src/sections/Education/Education.module.css',
      'src/sections/Publications/Publications.module.css',
      'src/sections/Technologies/Technologies.module.css',
    ].map(read)

    it('the active heading fades to the large-text accent red via a color transition', () => {
      for (const sheet of sheets) {
        expect(sheet).toMatch(/\.heading\s*\{[^}]*transition:\s*color\s+0\.4s/)
        expect(sheet).toMatch(
          /\.heading\[data-active=['"]true['"]\]\s*\{[^}]*color:\s*var\(--color-accent\)/,
        )
      }
    })

    it('drops the fade under reduced motion — the color flips instantly', () => {
      for (const sheet of sheets) {
        expect(sheet).toMatch(
          /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.heading\s*\{[\s\S]*?transition:\s*none/,
        )
      }
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
        '--scene-figure-rgb',
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

    it('exposes the scene-ink token for the flow-field canvas in both modes', () => {
      expect(css).toMatch(/--scene-figure-rgb:/)
      expect(css).not.toMatch(/--scene-piece-rgb/)
      expect(css).not.toMatch(/--scene-figure:\s*#/)
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
