import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/gsap', () => ({
  gsap: { context: () => ({ revert: () => {} }), from: () => {} },
  prefersReducedMotion: () => false,
}))

import { Publications } from './Publications'

describe('Publications', () => {
  it('renders 2 papers newest-first (RIVF first)', () => {
    render(<Publications />)
    expect(screen.getByRole('heading', { level: 2, name: 'Publications' })).toBeInTheDocument()
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(2)
    expect(within(articles[0]).getByText(/IEEE-RIVF/)).toBeInTheDocument()
  })

  it('emphasizes the owner name in each author list', () => {
    render(<Publications />)
    const owners = document.querySelectorAll('[data-owner]')
    expect(owners).toHaveLength(2)
    for (const el of owners) expect(el.textContent).toBe('Võ Bách Khôi')
  })

  it('links each paper to its DOI in a new tab', () => {
    render(<Publications />)
    const links = screen.getAllByRole('link', { name: /^10\./ })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('href')).toMatch(/^https?:\/\//)
    }
  })
})
