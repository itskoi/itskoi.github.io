import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Education } from './Education'

describe('Education', () => {
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
})
