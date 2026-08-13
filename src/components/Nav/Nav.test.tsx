import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { scrollTo } = vi.hoisted(() => ({ scrollTo: vi.fn() }))

vi.mock('@/lib/lenis', () => ({ scrollTo }))

import { Nav } from './Nav'

describe('Nav', () => {
  beforeEach(() => {
    scrollTo.mockClear()
  })

  it('renders four anchor links to the sections', () => {
    render(<Nav />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '#experience')
    expect(screen.getByRole('link', { name: 'Education' })).toHaveAttribute('href', '#education')
    expect(screen.getByRole('link', { name: 'Publications' })).toHaveAttribute(
      'href',
      '#publications',
    )
    expect(screen.getByRole('link', { name: 'Technologies' })).toHaveAttribute(
      'href',
      '#technologies',
    )
  })

  it('is a <nav> with an aria-label', () => {
    const { container } = render(<Nav />)
    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
    expect(nav).toHaveAttribute('aria-label', 'Sections')
  })

  it('smooth-scrolls via Lenis instead of a native jump on click', async () => {
    const user = userEvent.setup()
    render(<Nav />)
    await user.click(screen.getByRole('link', { name: 'Education' }))
    expect(scrollTo).toHaveBeenCalledWith('#education')
    expect(scrollTo).toHaveBeenCalledTimes(1)
  })

  it('renders the theme toggle inside the nav', () => {
    render(<Nav />)
    expect(screen.getByRole('button', { name: /switch to (light|dark) mode/i })).toBeInTheDocument()
  })
})
