import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { experience } from '@/data/portfolio'
import { ProjectScene } from './ProjectScene'

const ids = experience.flatMap((item) => item.projects.map((project) => project.id))
const css = readFileSync(
  resolve(process.cwd(), 'src/components/ProjectScene/ProjectScene.module.css'),
  'utf8',
)

describe('ProjectScene', () => {
  it.each(ids)('%s draws an image with a text alternative and a schematic caption', (id) => {
    render(<ProjectScene id={id} active />)
    const figure = screen.getByRole('figure')
    expect(figure).toHaveAttribute('data-scene', id)
    expect(figure).toHaveAttribute('data-active', 'true')
    expect(within(figure).getByRole('img').getAttribute('aria-label')?.length).toBeGreaterThan(40)
    expect(within(figure).getByText(/Schematic/)).toBeInTheDocument()
  })

  const SCENES = {
    companion: {
      input: 'What should I eat tonight to hit my protein?',
      titles: [
        'Input guardrail',
        'Break the task down',
        'Look up profile, food log',
        'Fetch nutrition guideline',
        'Gather claims',
        'Write the answer',
        'Output guardrail',
      ],
      output: 'You have 32 g protein left today.',
    },
    meals: {
      input: 'allergy: shrimp',
      titles: [
        'Work out what is left',
        'Find meals they would eat',
        'Fit each portion to the day',
        "Rank by what they'll accept",
        'Safety filter',
      ],
      output: 'Cơm tấm gà',
    },
    sdd: {
      input: 'WAO-172 · Add a daily water reminder',
      titles: [
        'AI writes the spec',
        'Split it into a task list',
        'Agent builds task by task',
        'AI code review',
        'Agent-driven E2E tests',
      ],
      output: 'Merge request !1287 merged',
    },
    voice: {
      input: 'một tô mì bò với ly trà đá',
      titles: [
        'LLM turns speech into queries',
        'Add alt names, tags, grams',
        'Search food, recipe catalog',
        'Rerank on prep state, brand',
      ],
      output: 'Mì bò (cooked)',
    },
    rag: {
      input: 'Which command sets a 10 ns clock on clk?',
      titles: [
        'Search the indexed manuals',
        'Pick the relevant passages',
        'Self-hosted LLM answers',
      ],
      output: 'create_clock -period 10 [get_ports clk]',
    },
    'text-to-image': {
      input: 'mặt trời trên đồi',
      titles: ['PhoBERT reads the prompt', 'Start from pure noise', 'Denoise step by step'],
      output: 'a sun over a hill',
    },
    sentiment: {
      input: 'thầy dạy rất dễ hiểu',
      titles: ['PhoBERT reads the sentence', 'Add linguistic features', 'Classify'],
      output: 'Positive',
    },
  } as const

  describe.each(ids)('%s', (id) => {
    const { input, titles, output } = SCENES[id]
    const drawing = () => screen.getByRole('img').textContent ?? ''
    const next = () => fireEvent.click(screen.getByRole('button', { name: /next/i }))

    it('shows its input', () => {
      render(<ProjectScene id={id} active />)
      expect(drawing()).toContain(input)
      expect(drawing()).not.toContain(output)
    })

    it('walks its steps, each under its own header', () => {
      render(<ProjectScene id={id} active />)
      titles.forEach((title, index) => {
        next()
        expect(screen.getByRole('status')).toHaveTextContent(`Step ${index + 1} / ${titles.length}`)
        expect(drawing()).toContain(`STEP ${index + 1} / ${titles.length} · ${title.toUpperCase()}`)
      })
    })

    it('ends on its step list and output', () => {
      render(<ProjectScene id={id} active />)
      for (let i = 0; i <= titles.length; i += 1) next()
      expect(screen.getByRole('status')).toHaveTextContent('Result')
      const text = drawing()
      const positions = titles.map((title) => text.indexOf(title))
      expect(positions).not.toContain(-1)
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
      expect(text).toContain(output)
    })
  })

  it.each([
    ['companion', ['93%', 'right call', '92%', 'factually correct', '89%', 'grounded in data']],
    ['meals', ['+59%', 'new-meal recall', '+13%', 'accept rate', 'offline, simulated users']],
    ['voice', ['+30% points', 'recall@3 vs keyword']],
    ['rag', ['<10 s', 'lookup, was ~1 min', '95%', 'answer accuracy']],
    ['sentiment', ['95.22%', 'F1, UIT-VSFC']],
    ['sdd', ['More reliable & autonomous', 'specs keep context', 'self-checked by agent E2E']],
    ['text-to-image', []],
  ] as const)('%s shows its highlights', (id, highlights) => {
    render(<ProjectScene id={id} active />)
    const strip = screen.queryByRole('list')
    if (highlights.length === 0) {
      expect(strip).toBeNull()
      return
    }
    for (const text of highlights) expect(strip?.parentElement).toHaveTextContent(text)
  })

  it.each(ids)('%s keeps results out of the drawing', (id) => {
    render(<ProjectScene id={id} active />)
    expect(screen.getByRole('img').textContent).not.toMatch(/%/)
  })

  describe('companion', () => {
    const TITLES = [
      'Input guardrail',
      'Break the task down',
      'Look up profile, food log',
      'Fetch nutrition guideline',
      'Gather claims',
      'Write the answer',
      'Output guardrail',
    ]
    const drawing = () => screen.getByRole('img').textContent ?? ''
    const where = () => screen.getByRole('status').textContent
    const press = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }))
    const wait = (seconds: number) => act(() => vi.advanceTimersByTime(seconds * 1000))

    beforeEach(() => vi.useFakeTimers())
    afterEach(() => {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    })

    it("shows the user's question and profile", () => {
      render(<ProjectScene id="companion" active />)
      expect(drawing()).toContain('What should I eat tonight to hit my protein?')
      expect(drawing()).toContain('protein target 90 g')
    })

    it('walks through its seven steps, each under its own header', () => {
      render(<ProjectScene id="companion" active />)
      expect(where()).toBe('Input')
      TITLES.forEach((title, index) => {
        press(/next/i)
        expect(where()).toBe(`Step ${index + 1} / 7`)
        expect(drawing()).toContain(`STEP ${index + 1} / 7 · ${title.toUpperCase()}`)
      })
    })

    it('ends on the step list and the answer', () => {
      render(<ProjectScene id="companion" active />)
      expect(drawing()).not.toContain('protein left today')
      for (let i = 0; i < 8; i += 1) press(/next/i)
      expect(where()).toBe('Result')
      const text = drawing()
      const positions = TITLES.map((title) => text.indexOf(title))
      expect(positions).not.toContain(-1)
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
      expect(text).toContain('You have 32 g protein left today.')
      expect(text).toContain('Wao protein guideline')
    })

    it('plays on its own and restarts on re-entry', () => {
      const { rerender } = render(<ProjectScene id="companion" active />)
      wait(1.1)
      expect(where()).toBe('Step 1 / 7')
      for (let i = 0; i < 7; i += 1) wait(2.2)
      expect(where()).toBe('Result')
      rerender(<ProjectScene id="companion" active={false} />)
      rerender(<ProjectScene id="companion" active />)
      expect(where()).toBe('Input')
    })

    it('pauses, and steps back and forward', () => {
      render(<ProjectScene id="companion" active />)
      press(/pause/i)
      expect(screen.queryByRole('button', { name: /pause/i })).toBeNull()
      wait(20)
      expect(where()).toBe('Input')
      press(/next/i)
      expect(where()).toBe('Step 1 / 7')
      press(/back/i)
      press(/back/i)
      expect(where()).toBe('Input')
      press(/play/i)
      wait(1.1)
      expect(where()).toBe('Step 1 / 7')
    })

    it('opens on the result under reduced motion and never moves on by itself', () => {
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }))
      render(<ProjectScene id="companion" active />)
      expect(where()).toBe('Result')
      wait(20)
      expect(where()).toBe('Result')
      press(/back/i)
      expect(where()).toBe('Step 7 / 7')
    })
  })

  it('marks an inactive scene inactive', () => {
    render(<ProjectScene id="voice" active={false} />)
    expect(document.querySelector('[data-scene="voice"]')).toHaveAttribute('data-active', 'false')
  })

  describe('motion contract', () => {
    it('animates only under the active scene, so re-entry replays', () => {
      const rules = css.match(/[^{}]*\{[^{}]*animation:[^{}]*\}/g) ?? []
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        if (rule.includes('none')) continue
        expect(rule).toContain('[data-active="true"]')
      }
    })

    it('holds the finished picture: keyframes only define a from state', () => {
      const keyframes = css.match(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) ?? []
      expect(keyframes.length).toBeGreaterThan(0)
      for (const block of keyframes) {
        expect(block).toMatch(/\bfrom\b/)
        expect(block).not.toMatch(/\bto\b|\d%/)
      }
    })

    it('never loops', () => {
      expect(css).not.toMatch(/infinite/)
    })

    it('drops every build-in under reduced motion', () => {
      expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none/)
    })
  })
})
