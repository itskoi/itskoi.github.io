import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { experience } from '@/data/portfolio'
import { Experience } from './Experience'
import styles from './Experience.module.css'

const { scrollTo } = vi.hoisted(() => ({ scrollTo: vi.fn() }))
vi.mock('@/lib/lenis', () => ({ scrollTo }))

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

  it('scrolls a project onto the band when its title is clicked, so its illustration shows', () => {
    stubBandObserver()
    render(<Experience />)
    const title = screen.getByRole('link', { name: 'Meal suggestions' })
    expect(title).toHaveAttribute('href', '#meals')
    fireEvent.click(title)
    // jsdom puts every element at the top, so the target is the band offset itself: the
    // project's top lands just above the band's top edge (ACTIVE_BAND spans 45–50%).
    expect(scrollTo).toHaveBeenCalledWith(16 - window.innerHeight * 0.45)
  })

  const projects = experience.flatMap((item) => item.projects)

  const activeScene = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[data-scene][data-active="true"]')).map((el) =>
      el.getAttribute('data-scene'),
    )

  it('renders the heading and one article per role', () => {
    render(<Experience />)
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(experience.length)
  })

  it('lists roles newest-first with Wao first', () => {
    render(<Experience />)
    const first = screen.getAllByRole('article')[0]
    expect(
      within(first).getByRole('heading', { level: 3, name: 'AI Engineer' }),
    ).toBeInTheDocument()
    expect(within(first).getByRole('link', { name: 'Wao' })).toBeInTheDocument()
  })

  it('renders every project as a heading with its stack and its bold results', () => {
    const { container } = render(<Experience />)
    for (const project of projects) {
      expect(screen.getByRole('heading', { level: 4, name: project.title })).toBeInTheDocument()
      for (const tool of project.stack) {
        expect(screen.getAllByText(tool).length).toBeGreaterThan(0)
      }
    }
    expect(within(container).getByText('Led a 4-person team').tagName).toBe('STRONG')
    expect(within(container).getByText('LLM agent').tagName).toBe('STRONG')
    expect(container.textContent).not.toContain('**')
  })

  it('shows only the title of a project until its details are opened', () => {
    render(<Experience />)
    for (const project of projects) {
      const block = document.getElementById(project.id) as HTMLElement
      const details = block.querySelector('details') as HTMLDetailsElement
      expect(details.open).toBe(false)
      expect(details.querySelector('summary')).toHaveTextContent('Read details')
      expect(details.querySelector('summary')).toHaveAccessibleName(
        `Read details: ${project.title}`,
      )
      expect(block.querySelector('h4')?.closest('details')).toBeNull()
      for (const tool of project.stack) expect(details).toHaveTextContent(tool)
      expect(details).toHaveTextContent(project.body[0].replaceAll('**', ''))
    }
  })

  it('keeps the non-project resume note', () => {
    render(<Experience />)
    expect(screen.getByText('AI training modules').tagName).toBe('STRONG')
  })

  it('links the Wao company to its external URL in a new tab', () => {
    render(<Experience />)
    const link = screen.getByRole('link', { name: 'Wao' })
    expect(link).toHaveAttribute('href', expect.stringContaining('apple.com'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('renders one period label per role in the mono voice', () => {
    const { container } = render(<Experience />)
    expect(container.querySelectorAll(`.${styles.period}`)).toHaveLength(experience.length)
  })

  it('renders one illustration per project, none active until a project is reached', () => {
    const { container } = render(<Experience />)
    expect(container.querySelectorAll('[data-scene]')).toHaveLength(projects.length)
    expect(activeScene(container)).toEqual([])
  })

  it('starts the first illustration as soon as the section reaches the band', () => {
    const observerClass = stubBandObserver()
    const { container } = render(<Experience />)
    fireBand(observerClass, true)
    expect(activeScene(container)).toEqual([projects[0].id])
    fireBand(observerClass, false)
    expect(activeScene(container)).toEqual([])
  })

  it('switches the illustration to the project crossing the band', () => {
    const observerClass = stubBandObserver()
    const { container } = render(<Experience />)
    const callback = observerClass.mock.calls.find(
      (call) => call[0] !== observerClass.mock.calls[0]?.[0],
    )?.[0]
    act(() => {
      callback?.(
        [
          {
            isIntersecting: true,
            target: document.getElementById('voice'),
          } as unknown as IntersectionObserverEntry,
        ],
        undefined as unknown as IntersectionObserver,
      )
    })
    expect(activeScene(container)).toEqual(['voice'])
    expect(document.getElementById('voice')).toHaveAttribute('data-active', 'true')
    expect(document.getElementById('companion')).toHaveAttribute('data-active', 'false')
  })

  it('gives every company a logo and an optional short description', () => {
    render(<Experience />)
    for (const item of experience) {
      const article = document.getElementById(item.id) as HTMLElement
      expect(article.querySelector('img')).toHaveAttribute('src', item.logo)
      const about = item.about ? ` — ${item.about}` : ''
      expect(article.querySelector('header')).toHaveTextContent(`${item.company}${about}`)
      expect(about.length).toBeLessThanOrEqual(73)
    }
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
