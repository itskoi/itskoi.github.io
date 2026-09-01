import { act, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Publications } from './Publications'

function stubBandObserver() {
  const observer = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
  const observerClass = vi.fn(
    (_callback: IntersectionObserverCallback, _init?: IntersectionObserverInit) => observer,
  )
  vi.stubGlobal('IntersectionObserver', observerClass)
  return observerClass
}

const fireBand = (observerClass: ReturnType<typeof stubBandObserver>, isIntersecting: boolean) => {
  const callback = observerClass.mock.calls[0]?.[0]
  act(() => {
    callback?.(
      [{ isIntersecting } as IntersectionObserverEntry],
      undefined as unknown as IntersectionObserver,
    )
  })
}

describe('Publications', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('marks the heading active when its section crosses the shared band', () => {
    const observerClass = stubBandObserver()
    render(<Publications />)
    fireBand(observerClass, true)
    expect(screen.getByRole('heading', { level: 2, name: 'Publications' })).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('renders the heading inactive where no observer exists (jsdom)', () => {
    render(<Publications />)
    expect(screen.getByRole('heading', { level: 2, name: 'Publications' })).toHaveAttribute(
      'data-active',
      'false',
    )
  })
})
