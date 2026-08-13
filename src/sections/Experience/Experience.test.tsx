import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/gsap', () => ({
  gsap: { context: () => ({ revert: () => {} }), from: () => {} },
  prefersReducedMotion: () => false,
}))

import { experience } from '@/data/portfolio'
import { Experience } from './Experience'
import styles from './Experience.module.css'

describe('Experience', () => {
  it('renders the heading and 4 role articles', () => {
    render(<Experience />)
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('lists roles newest-first with Wao first', () => {
    render(<Experience />)
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(experience.length)
    expect(
      within(articles[0]).getByRole('heading', { level: 3, name: 'Fullstack AI Engineer' }),
    ).toBeInTheDocument()
    expect(within(articles[0]).getByRole('link', { name: 'Wao' })).toBeInTheDocument()
  })

  it('renders at least one highlight per role', () => {
    render(<Experience />)
    for (const article of screen.getAllByRole('article')) {
      expect(within(article).getAllByRole('listitem').length).toBeGreaterThan(0)
    }
  })

  it('links the Wao company to its external URL in a new tab', () => {
    render(<Experience />)
    const link = screen.getByRole('link', { name: 'Wao' })
    expect(link).toHaveAttribute('href', expect.stringContaining('apple.com'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('renders the timeline spine, fill, and one marker per entry', () => {
    const { container } = render(<Experience />)
    expect(container.querySelector(`.${styles.spine}`)).not.toBeNull()
    expect(container.querySelector(`.${styles.spineFill}`)).not.toBeNull()
    expect(container.querySelectorAll(`.${styles.marker}`)).toHaveLength(experience.length)
  })
})
