import { act, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { experience } from '@/data/portfolio'
import { Experience } from './Experience'
import styles from './Experience.module.css'

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

describe('Experience', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('renders one period label per entry (hairline table, no timeline spine)', () => {
    const { container } = render(<Experience />)
    expect(container.querySelectorAll(`.${styles.period}`)).toHaveLength(experience.length)
    expect(container.querySelector(`.${styles.spine}`)).toBeNull()
    expect(container.querySelector(`.${styles.spineFill}`)).toBeNull()
    expect(container.querySelector(`.${styles.marker}`)).toBeNull()
  })

  it('marks the heading active when its section crosses the shared band', () => {
    const observerClass = stubBandObserver()
    render(<Experience />)
    fireBand(observerClass, true)
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('renders the heading inactive where no observer exists (jsdom)', () => {
    render(<Experience />)
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toHaveAttribute(
      'data-active',
      'false',
    )
  })
})
