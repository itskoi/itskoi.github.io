import { describe, expect, it } from 'vitest'

// Mirror of the palette in src/styles/global.css. If a token changes, this gate
// forces a deliberate re-check of contrast rather than silently regressing.

function channel(value: number): number {
  const s = value / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const h = hex.replace('#', '')
  return (
    0.2126 * channel(Number.parseInt(h.slice(0, 2), 16)) +
    0.7152 * channel(Number.parseInt(h.slice(2, 4), 16)) +
    0.0722 * channel(Number.parseInt(h.slice(4, 6), 16))
  )
}

function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const AA_NORMAL = 4.5
const AA_LARGE = 3 // large text (≥ 1.5rem bold / 1.875rem) and non-text graphics

describe('palette contrast (WCAG)', () => {
  describe('light mode (paper default)', () => {
    const bg = '#ffffff'
    it('body text on paper', () => {
      expect(contrast('#0a0a0a', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('muted text on paper', () => {
      expect(contrast('#55595f', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent-strong (small red text) on paper', () => {
      expect(contrast('#c00016', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent (Swiss red) meets the large-text / non-text bar on paper', () => {
      expect(contrast('#e30613', bg)).toBeGreaterThanOrEqual(AA_LARGE)
    })
  })

  describe('dark mode (ink field)', () => {
    const bg = '#0a0a0a'
    it('body text on ink', () => {
      expect(contrast('#fafafa', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('muted text on ink', () => {
      expect(contrast('#a3a3a3', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent (red) text on ink', () => {
      expect(contrast('#ff2b39', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent-strong (small red text) on ink', () => {
      expect(contrast('#ff5a66', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  })
})
