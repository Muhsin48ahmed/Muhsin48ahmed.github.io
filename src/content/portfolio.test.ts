import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

  test('links the résumé button to a PDF that ships in public/', () => {
    const { resumeUrl } = portfolio.profile
    expect(resumeUrl).toMatch(/^\/.+\.pdf$/)
    expect(existsSync(resolve(__dirname, '../../public', resumeUrl!.slice(1)))).toBe(true)
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

/** Pixel size from a PNG (IHDR) or baseline/progressive JPEG (SOF0/SOF2) header. */
function imageSize(file: Buffer): [number, number] {
  if (file.readUInt32BE(0) === 0x89504e47) return [file.readUInt32BE(16), file.readUInt32BE(20)]
  let offset = 2
  while (offset < file.length) {
    const marker = file.readUInt16BE(offset)
    if (marker === 0xffc0 || marker === 0xffc2) return [file.readUInt16BE(offset + 7), file.readUInt16BE(offset + 5)]
    offset += 2 + file.readUInt16BE(offset + 2)
  }
  throw new Error('unsupported image format')
}

describe('project charts', () => {
  test('every chart image ships in public/', () => {
    const charts = portfolio.projects.flatMap((p) => p.charts ?? [])
    expect(charts.length).toBeGreaterThan(0)
    charts.forEach((c) => {
      expect(c.src).toMatch(/^\/charts\/.+\.(png|jpg)$/)
      expect(c.alt.trim()).not.toBe('')
      expect(existsSync(resolve(__dirname, '../../public', c.src.slice(1)))).toBe(true)
    })
  })

  test('the surge capstone links its live Streamlit demo', () => {
    const surge = portfolio.projects.find((p) => p.lab === 'surge')
    expect(surge?.demoUrl).toMatch(/^https:\/\/[a-z0-9-]+\.streamlit\.app\/?$/)
  })

  test('every chart declares the true pixel size of its image (prevents layout shift)', () => {
    portfolio.projects.flatMap((p) => p.charts ?? []).forEach((chart) => {
      const file = readFileSync(resolve(__dirname, '../../public', chart.src.slice(1)))
      expect([chart.width, chart.height], chart.src).toEqual(imageSize(file))
    })
  })

  test('exactly one project hosts the surge lab', () => {
    expect(portfolio.projects.filter((p) => p.lab === 'surge')).toHaveLength(1)
  })
})
