import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/gsap', () => ({
  gsap: { context: () => ({ revert: () => {} }), from: () => {} },
  prefersReducedMotion: () => false,
}))

import { technologies } from '@/data/portfolio'
import { Technologies } from './Technologies'

describe('Technologies', () => {
  it('renders all 6 categories', () => {
    render(<Technologies />)
    expect(screen.getByRole('heading', { level: 2, name: 'Technologies' })).toBeInTheDocument()
    for (const group of technologies) {
      expect(screen.getByText(group.category)).toBeInTheDocument()
    }
  })

  it('lists the tools under each category', () => {
    render(<Technologies />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('LangChain')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
  })
})
