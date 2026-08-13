import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const spies = vi.hoisted(() => {
  const ctxRevert = vi.fn()
  const gsapContext = vi.fn((fn: () => void) => {
    fn()
    return { revert: ctxRevert }
  })
  const gsapFromTo = vi.fn()
  const timelineFrom = vi.fn()
  const gsapTimeline = vi.fn(() => ({ from: timelineFrom }))
  const prefersReducedMotion = vi.fn(() => false)
  return { ctxRevert, gsapContext, gsapFromTo, gsapTimeline, timelineFrom, prefersReducedMotion }
})

vi.mock('@/lib/gsap', () => ({
  gsap: { context: spies.gsapContext, fromTo: spies.gsapFromTo, timeline: spies.gsapTimeline },
  prefersReducedMotion: spies.prefersReducedMotion,
}))

import { Hero } from './Hero'

describe('Hero', () => {
  beforeEach(() => {
    spies.gsapContext.mockClear()
    spies.gsapFromTo.mockClear()
    spies.gsapTimeline.mockClear()
    spies.timelineFrom.mockClear()
    spies.ctxRevert.mockClear()
    spies.prefersReducedMotion.mockReset()
    spies.prefersReducedMotion.mockReturnValue(false)
  })

  it('renders the name as h1, plus role and location', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: 'Võ Bách Khôi' })).toBeInTheDocument()
    expect(screen.getByText('Fullstack AI Engineer')).toBeInTheDocument()
    expect(screen.getByText('HCM City, Vietnam')).toBeInTheDocument()
  })

  it('no longer shows the placeholder copy', () => {
    render(<Hero />)
    expect(screen.queryByText(/Built with React/)).not.toBeInTheDocument()
  })

  it('links to LinkedIn and email', () => {
    render(<Hero />)
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' })
    expect(linkedin).toHaveAttribute('target', '_blank')
    expect(linkedin.getAttribute('href')).toContain('linkedin.com/in/bachkhoivo')

    const email = screen.getByRole('link', { name: 'itskoiwork@gmail.com' })
    expect(email).toHaveAttribute('href', 'mailto:itskoiwork@gmail.com')
  })

  it('wires the intro timeline and parallax on mount', () => {
    render(<Hero />)
    expect(spies.gsapTimeline).toHaveBeenCalledTimes(1)
    expect(spies.timelineFrom).toHaveBeenCalledWith('[data-intro]', expect.any(Object))
    expect(spies.gsapFromTo).toHaveBeenCalledTimes(1)
  })

  it('registers no motion under reduced motion', () => {
    spies.prefersReducedMotion.mockReturnValue(true)
    render(<Hero />)
    expect(spies.gsapTimeline).not.toHaveBeenCalled()
    expect(spies.gsapFromTo).not.toHaveBeenCalled()
  })
})
