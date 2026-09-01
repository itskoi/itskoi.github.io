import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Education } from './Education'

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

describe('Education', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders school, degree, and GPA', () => {
    render(<Education />)
    expect(screen.getByRole('heading', { level: 2, name: 'Education' })).toBeInTheDocument()
    expect(screen.getByText('University of Science')).toBeInTheDocument()
    expect(screen.getByText(/Computer Science/)).toBeInTheDocument()
    expect(screen.getByText(/3\.74\/4\.0/)).toBeInTheDocument()
  })

  it('renders the awards', () => {
    render(<Education />)
    expect(screen.getByText(/Outstanding Freshman Scholarship/)).toBeInTheDocument()
    expect(screen.getByText(/Encouragement Scholarship/)).toBeInTheDocument()
  })

  it('renders certifications, linking the ones with URLs in a new tab', () => {
    render(<Education />)
    expect(screen.getByText(/TOEIC 900/)).toBeInTheDocument()
    const cert = screen.getByRole('link', { name: /IBM AI Engineer/ })
    expect(cert).toHaveAttribute('target', '_blank')
    expect(cert).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('marks the heading active when its section crosses the shared band', () => {
    const observerClass = stubBandObserver()
    render(<Education />)
    fireBand(observerClass, true)
    expect(screen.getByRole('heading', { level: 2, name: 'Education' })).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('renders the heading inactive where no observer exists (jsdom)', () => {
    render(<Education />)
    expect(screen.getByRole('heading', { level: 2, name: 'Education' })).toHaveAttribute(
      'data-active',
      'false',
    )
  })
})
