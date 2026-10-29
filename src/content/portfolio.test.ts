import { portfolio } from './portfolio'
import { SECTIONS, captionFor, journeyStopId } from './sections'

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

  test('has a journey and projects for the 3D world to show', () => {
    expect(portfolio.journey.length).toBeGreaterThan(0)
    expect(portfolio.projects.length).toBeGreaterThan(0)
  })
})

describe('sections', () => {
  test('ids are unique', () => {
    expect(new Set(SECTIONS.map((s) => s.id)).size).toBe(SECTIONS.length)
  })

  test('captionFor returns the zone caption', () => {
    expect(captionFor('projects')).toContain('holo deck')
  })

  test('journeyStopId names each milestone stop', () => {
    expect(journeyStopId(2)).toBe('journey-2')
  })
})
