import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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

  it('no longer renders the Placeholder section', () => {
    render(<App />)
    expect(screen.queryByText(/More content coming soon/)).not.toBeInTheDocument()
  })
})
