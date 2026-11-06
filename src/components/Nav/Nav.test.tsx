import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  describe('Back to top', () => {
    afterEach(() => vi.unstubAllGlobals())

    // Renders Nav beside a section, and returns a way to put that section on the band.
    const renderWithSection = () => {
      let callback: IntersectionObserverCallback = () => {}
      vi.stubGlobal(
        'IntersectionObserver',
        vi.fn((cb: IntersectionObserverCallback) => {
          callback = cb
          return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
        }),
      )
      render(
        <>
          <Nav />
          <section id="experience" />
        </>,
      )
      const target = document.getElementById('experience') as HTMLElement
      return () =>
        act(() =>
          callback(
            [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
            {} as IntersectionObserver,
          ),
        )
    }

    it('shows Back to top only once a section is active', () => {
      const reachSection = renderWithSection()
      expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull()
      reachSection()
      expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument()
    })

    it('Back to top scrolls to the top through Lenis', async () => {
      const user = userEvent.setup()
      renderWithSection()()
      await user.click(screen.getByRole('button', { name: 'Back to top' }))
      expect(scrollTo).toHaveBeenCalledWith(0)
    })
  })

  it('renders the theme toggle inside the nav', () => {
    render(<Nav />)
    expect(screen.getByRole('button', { name: /switch to (light|dark) mode/i })).toBeInTheDocument()
  })
})
