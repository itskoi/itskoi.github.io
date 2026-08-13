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

describe('palette contrast (WCAG AA, body text)', () => {
  describe('dark mode', () => {
    const bg = '#08090c'
    it('body text on background', () => {
      expect(contrast('#f3f4f6', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent (electric blue) text on background', () => {
      expect(contrast('#5ba4ff', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent-2 (royal blue) text on background', () => {
      expect(contrast('#3b82f6', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  })

  describe('light mode', () => {
    const bg = '#f7f8fa'
    it('body text on background', () => {
      expect(contrast('#0b0e12', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent (deep cobalt) text on background', () => {
      expect(contrast('#1d4ed8', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
    it('accent-2 (deeper royal) text on background', () => {
      expect(contrast('#1e40af', bg)).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  })
})
