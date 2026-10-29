import { portfolio } from './portfolio'
import { SECTIONS, SECTION_IDS, figureFor } from './sections'

describe('portfolio content', () => {
  test('has a name, role and contact email', () => {
    const { name, role, email } = portfolio.profile
    expect(name.trim()).not.toBe('')
    expect(role.trim()).not.toBe('')
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })

  test('uses absolute https links for socials and projects', () => {
    const links = [
      ...portfolio.profile.socials.map((s) => s.href),
      ...portfolio.projects.flatMap((p) => [p.repoUrl, p.demoUrl]).filter(Boolean),
    ]
    expect(links.every((href) => href!.startsWith('https://'))).toBe(true)
  })

  test('has one skill group per cluster in the skills scene', () => {
    expect(portfolio.skillGroups).toHaveLength(4)
  })
})

describe('sections', () => {
  test('ids are unique', () => {
    expect(new Set(SECTION_IDS).size).toBe(SECTIONS.length)
  })

  test('figureFor returns the caption for a section', () => {
    expect(figureFor('projects')).toContain('loss landscape')
  })
})
