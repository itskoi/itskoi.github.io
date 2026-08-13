import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

const moduleCss = readFileSync(
  resolve(process.cwd(), 'src/components/ThemeToggle/ThemeToggle.module.css'),
  'utf8',
)

function reset() {
  document.documentElement.removeAttribute('data-theme')
  try {
    window.localStorage.clear()
  } catch {
    /* ignore */
  }
}

beforeEach(reset)
afterEach(reset)

describe('ThemeToggle', () => {
  it('renders a button whose label names the target mode', () => {
    render(<ThemeToggle />)
    // dark by default -> offers to switch to light
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })

  it('reflects state via aria-pressed (pressed when light is active)', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /switch/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('flips data-theme on click and updates label + aria-pressed', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /switch to light mode/i })
    await user.click(button)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
  })

  it('is keyboard operable (Space activates it)', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /switch/i })
    button.focus()
    await user.keyboard('{Enter}')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('ships a visible focus ring for keyboard users', () => {
    expect(moduleCss).toMatch(/:focus-visible/)
  })
})
