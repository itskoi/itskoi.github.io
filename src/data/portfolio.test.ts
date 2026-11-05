import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { education, experience, profile, publications, technologies } from './portfolio'

describe('portfolio data', () => {
  describe('profile', () => {
    it('exposes name, role, location, email, and LinkedIn', () => {
      expect(profile.name).toBe('Võ Bách Khôi')
      expect(profile.role).toBe('AI Engineer')
      expect(profile.location).toBe('Ho Chi Minh City, Vietnam')
      expect(profile.email.href).toContain('itskoiwork@gmail.com')
      expect(profile.linkedin.href).toContain('linkedin.com/in/bachkhoivo')
    })

    it('does not expose a phone number', () => {
      expect(profile).not.toHaveProperty('phone')
    })
  })

  describe('experience', () => {
    const projects = experience.flatMap((item) => item.projects)
    const pageText = JSON.stringify({ experience, education, publications, technologies })

    it('has the 3 resume roles newest-first, without the removed internship', () => {
      expect(experience.map((item) => item.company)).toEqual([
        'Wao',
        'Uniquify',
        'Computational Linguistics Center (CLC), HCMUS',
      ])
      expect(pageText).not.toContain('ITR')
    })

    it('carries the resume title and dates for Wao', () => {
      expect(experience[0].role).toBe('AI Engineer')
      expect(experience[0].period).toBe('Mar 2025 – Nov 2026')
      expect(experience[0].context).toContain('Sole AI engineer')
    })

    it('lists the Wao projects in the resume order', () => {
      expect(experience[0].projects.map((project) => project.id)).toEqual([
        'companion',
        'meals',
        'sdd',
        'voice',
      ])
    })

    it('gives every project a unique illustration id, a title, and body text', () => {
      expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length)
      for (const project of projects) {
        expect(project.title).toBeTruthy()
        expect(project.body.length).toBeGreaterThan(0)
      }
    })

    it('keeps the qualifier that keeps the Companion claim accurate', () => {
      expect(projects.find((project) => project.id === 'companion')?.title).toContain('POC')
    })

    it.each(projects.map((project) => [project.id, project.body.join(' ')]))(
      '%s says what the project does, with no evaluation results',
      (_id, body) => {
        expect(body).not.toMatch(
          /\d%|recall|ndcg|\bf1\b|accuracy|\beval|simulated|percentage points|dcn-v2/i,
        )
      },
    )

    it.each([
      ['companion', ['input guardrail', 'planner', 'answerer', 'ledger', 'output guardrail']],
      ['meals', ['remaining calories', 'two-tower', 'portion', 'LightGBM']],
      ['voice', ['structured queries', 'reranked', 'preparation state']],
      ['rag', ['Markdown', 'indexed', 'LangGraph', 'self-hosted']],
      ['text-to-image', ['PhoBERT', 'skip connections', 'diffusion']],
      ['sentiment', ['PhoBERT', 'linguistic features']],
    ])('%s describes how it works', (id, phrases) => {
      const body = projects.find((project) => project.id === id)?.body.join(' ') ?? ''
      for (const phrase of phrases) expect(body).toContain(phrase)
    })

    describe('skim highlights', () => {
      const resume = readFileSync(resolve(process.cwd(), 'docs/resume.html'), 'utf8')
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
      const resumeTexts = experience.flatMap((item) => [
        ...(item.context ? [item.context] : []),
        ...(item.notes ?? []),
      ])
      const texts = [...resumeTexts, ...projects.flatMap((project) => project.body)]

      it.each(resumeTexts)('keeps the resume wording: %s', (text) => {
        expect(resume).toContain(text.replaceAll('**', ''))
      })

      it.each(texts)('highlights without bolding everything: %s', (text) => {
        expect(text.split('**').length % 2).toBe(1)
        const bold = text.split('**').filter((_, index) => index % 2 === 1)
        expect(bold.length).toBeGreaterThan(0)
        expect(bold.join('').length).toBeLessThan(text.replaceAll('**', '').length * 0.5)
      })
    })

    it('does not expose the numbers the resume hides', () => {
      for (const hidden of ['10K', '100K', '800K', '3,000', '1,000', '169 ', 'Qwen', 'Gemini']) {
        expect(pageText).not.toContain(hidden)
      }
    })
  })

  describe('education', () => {
    it('exposes school, degree, period, and GPA', () => {
      expect(education.school).toBe('University of Science, VNU-HCM (HCMUS)')
      expect(education.degree).toContain('Computer Science')
      expect(education.period).toBeTruthy()
      expect(education.gpa.primary).toContain('3.74')
    })

    it('has 2 awards and 5 certifications', () => {
      expect(education.awards).toHaveLength(2)
      expect(education.certifications).toHaveLength(5)
    })
  })

  describe('publications', () => {
    it('has 2 papers newest-first (RIVF first)', () => {
      expect(publications).toHaveLength(2)
      expect(publications[0].venue).toBe("IEEE RIVF'23")
    })

    it('every paper lists the owner as an author and has a DOI link', () => {
      for (const pub of publications) {
        expect(pub.authors).toContain(pub.owner)
        expect(pub.doi.href).toMatch(/^https?:\/\//)
      }
    })
  })

  describe('technologies', () => {
    it('has the 5 resume categories each with tools', () => {
      expect(technologies.map((group) => group.category)).toEqual([
        'LLM & Agents',
        'Search & ML',
        'Backend & Full-stack',
        'Infra',
        'Dev Environment',
      ])
      for (const group of technologies) {
        expect(group.category).toBeTruthy()
        expect(group.tools.length).toBeGreaterThan(0)
      }
    })
  })
})
