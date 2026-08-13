import { describe, expect, it } from 'vitest'
import { education, experience, profile, publications, technologies } from './portfolio'

describe('portfolio data', () => {
  describe('profile', () => {
    it('exposes name, role, location, email, and LinkedIn', () => {
      expect(profile.name).toBe('Võ Bách Khôi')
      expect(profile.role).toBe('Fullstack AI Engineer')
      expect(profile.location).toBe('HCM City, Vietnam')
      expect(profile.email.href).toContain('itskoiwork@gmail.com')
      expect(profile.linkedin.href).toContain('linkedin.com/in/bachkhoivo')
    })

    it('does not expose a phone number', () => {
      expect(profile).not.toHaveProperty('phone')
    })
  })

  describe('experience', () => {
    it('has 4 roles in newest-first order, Wao first', () => {
      expect(experience).toHaveLength(4)
      expect(experience[0].company).toBe('Wao')
    })

    it('every role has role, company, period, and at least one highlight', () => {
      for (const item of experience) {
        expect(item.role).toBeTruthy()
        expect(item.company).toBeTruthy()
        expect(item.period).toBeTruthy()
        expect(item.highlights.length).toBeGreaterThan(0)
      }
    })
  })

  describe('education', () => {
    it('exposes school, degree, period, and GPA', () => {
      expect(education.school).toBe('University of Science')
      expect(education.degree).toContain('Computer Science')
      expect(education.period).toBeTruthy()
      expect(education.gpa.primary).toContain('3.74')
    })

    it('has 3 awards and 5 certifications', () => {
      expect(education.awards).toHaveLength(3)
      expect(education.certifications).toHaveLength(5)
    })
  })

  describe('publications', () => {
    it('has 2 papers newest-first (RIVF first)', () => {
      expect(publications).toHaveLength(2)
      expect(publications[0].venue).toBe("IEEE-RIVF'23")
    })

    it('every paper lists the owner as an author and has a DOI link', () => {
      for (const pub of publications) {
        expect(pub.authors).toContain(pub.owner)
        expect(pub.doi.href).toMatch(/^https?:\/\//)
      }
    })
  })

  describe('technologies', () => {
    it('has 6 categories each with tools', () => {
      expect(technologies).toHaveLength(6)
      for (const group of technologies) {
        expect(group.category).toBeTruthy()
        expect(group.tools.length).toBeGreaterThan(0)
      }
    })
  })
})
