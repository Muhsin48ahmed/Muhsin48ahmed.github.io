import { render, screen, within } from '@testing-library/react'
import { portfolio } from '../content/portfolio'
import { About } from './About'
import { Contact } from './Contact'
import { Experience } from './Experience'
import { Hero } from './Hero'
import { Nav } from './Nav'
import { Projects } from './Projects'
import { SECTIONS } from '../content/sections'

describe('Hero', () => {
  test('shows the name as the page heading with role and stats', () => {
    render(<Hero profile={portfolio.profile} stats={portfolio.stats} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(portfolio.profile.name)
    expect(screen.getByText(portfolio.profile.role)).toBeInTheDocument()
    portfolio.stats.forEach((s) => expect(screen.getByText(s.label)).toBeInTheDocument())
  })

  test('links to the projects and contact sections', () => {
    render(<Hero profile={portfolio.profile} stats={portfolio.stats} />)
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '#projects')
    expect(screen.getByRole('link', { name: /get in touch/i })).toHaveAttribute('href', '#contact')
  })
})

describe('About', () => {
  test('renders the bio and every skill', () => {
    render(<About profile={portfolio.profile} skillGroups={portfolio.skillGroups} />)
    expect(screen.getByText(portfolio.profile.bio[0]!)).toBeInTheDocument()
    portfolio.skillGroups
      .flatMap((g) => g.skills)
      .forEach((skill) => expect(screen.getByText(skill)).toBeInTheDocument())
  })
})

describe('Experience', () => {
  test('lists every role with its company and period', () => {
    render(<Experience items={portfolio.experience} />)
    const entries = screen.getAllByRole('listitem', { name: /.+/ })
    expect(entries).toHaveLength(portfolio.experience.length)
    portfolio.experience.forEach((job) => {
      expect(screen.getByRole('heading', { name: job.role })).toBeInTheDocument()
      expect(screen.getByText(job.company)).toBeInTheDocument()
      expect(screen.getByText(job.period)).toBeInTheDocument()
    })
  })
})

describe('Projects', () => {
  test('renders a card per project with its impact', () => {
    render(<Projects items={portfolio.projects} />)
    portfolio.projects.forEach((p) => {
      const card = screen.getByRole('article', { name: p.title })
      expect(within(card).getByText(p.impact)).toBeInTheDocument()
    })
  })

  test('opens external links safely in a new tab', () => {
    render(<Projects items={portfolio.projects} />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  test('only shows the links a project has', () => {
    render(<Projects items={[{ title: 'Solo', summary: 's', impact: 'i', stack: [] }]} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('Contact', () => {
  test('offers a mailto link and every social profile', () => {
    render(<Contact profile={portfolio.profile} />)
    expect(screen.getByRole('link', { name: portfolio.profile.email })).toHaveAttribute(
      'href',
      `mailto:${portfolio.profile.email}`,
    )
    portfolio.profile.socials.forEach((s) =>
      expect(screen.getByRole('link', { name: s.label })).toHaveAttribute('href', s.href),
    )
  })

  test('shows a resume link only when one is configured', () => {
    const { rerender } = render(<Contact profile={portfolio.profile} />)
    expect(screen.getByRole('link', { name: /résumé/i })).toBeInTheDocument()
    rerender(<Contact profile={{ ...portfolio.profile, resumeUrl: undefined }} />)
    expect(screen.queryByRole('link', { name: /résumé/i })).not.toBeInTheDocument()
  })
})

describe('Nav', () => {
  test('links to every section after the hero', () => {
    render(<Nav name={portfolio.profile.name} />)
    SECTIONS.slice(1).forEach((s) =>
      expect(screen.getByRole('link', { name: s.label })).toHaveAttribute('href', `#${s.id}`),
    )
  })
})
