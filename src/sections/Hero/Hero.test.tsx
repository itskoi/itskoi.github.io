import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero } from './Hero'

describe('Hero', () => {
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
})
