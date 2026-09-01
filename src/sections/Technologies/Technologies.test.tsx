import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { technologies } from '@/data/portfolio'
import { Technologies } from './Technologies'

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

describe('Technologies', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('marks the heading active when its section crosses the shared band', () => {
    const observerClass = stubBandObserver()
    render(<Technologies />)
    fireBand(observerClass, true)
    expect(screen.getByRole('heading', { level: 2, name: 'Technologies' })).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('renders the heading inactive where no observer exists (jsdom)', () => {
    render(<Technologies />)
    expect(screen.getByRole('heading', { level: 2, name: 'Technologies' })).toHaveAttribute(
      'data-active',
      'false',
    )
  })
})
