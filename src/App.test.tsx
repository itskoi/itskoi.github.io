import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/lenis', () => ({
  createSmoothScroll: () => ({ lenis: {}, destroy: vi.fn() }),
}))

import { App } from './App'

describe('App', () => {
  it('composes the nav, hero, and all four content sections', () => {
    render(<App />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Võ Bách Khôi' })).toBeInTheDocument()
    for (const name of ['Experience', 'Education', 'Publications', 'Technologies']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    }
  })

  describe('backdrop', () => {
    afterEach(() => {
      delete document.documentElement.dataset.theme
    })

    it.each([
      ['light', 'data-binary-star-canvas'],
      ['dark', 'data-black-hole-canvas'],
    ])('on the %s theme, draws one backdrop canvas: %s', (theme, attribute) => {
      document.documentElement.dataset.theme = theme
      const { container } = render(<App />)
      const backdrops = container.querySelectorAll(
        'canvas[data-binary-star-canvas], canvas[data-black-hole-canvas]',
      )
      expect(backdrops).toHaveLength(1)
      expect(backdrops[0]).toHaveAttribute(attribute)
    })
  })

  it('no longer renders the Placeholder section', () => {
    render(<App />)
    expect(screen.queryByText(/More content coming soon/)).not.toBeInTheDocument()
  })
})
