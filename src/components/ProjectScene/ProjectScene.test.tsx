import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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

  it.each([
    [
      'companion',
      [
        'input guardrail',
        'user behaviors',
        'planner',
        'break down',
        'call tools',
        'observe',
        'claims',
        'answerer',
        'gather claims',
        'ledger',
        'result',
        'output guardrail',
        'final answer',
      ],
    ],
    [
      'meals',
      [
        'remaining calories',
        'user tower',
        'meal tower',
        'optimize portion',
        'lightgbm',
        'output meals',
      ],
    ],
    ['rag', ['pdf', 'parse', 'markdown', 'index', 'langgraph', 'self-hosted llm', 'create_clock']],
    ['text-to-image', ['phobert', 'skip connections', 'denoise', 'diffusion model', 'image']],
  ] as const)('%s draws its pipeline in order', (id, stages) => {
    render(<ProjectScene id={id} active />)
    const text = screen.getByRole('img').textContent?.toLowerCase() ?? ''
    const positions = stages.map((stage) => text.indexOf(stage))
    expect(positions).not.toContain(-1)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
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
