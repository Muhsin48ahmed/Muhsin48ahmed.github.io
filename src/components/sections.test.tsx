import { fireEvent, render, screen, within } from '@testing-library/react'
import { portfolio } from '../content/portfolio'
import { SECTIONS, journeyStopId } from '../content/sections'
import { useWorld } from '../world/store'
import { About } from './About'
import { Contact } from './Contact'
import { Hero } from './Hero'
import { Journey } from './Journey'
import { Nav } from './Nav'
import { ProjectModal } from './ProjectModal'
import { Projects } from './Projects'

const initial = useWorld.getState()
afterEach(() => useWorld.setState(initial, true))

describe('Hero', () => {
  test('shows the name as the page heading with role and stats', () => {
    render(<Hero profile={portfolio.profile} stats={portfolio.stats} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(portfolio.profile.name)
    expect(screen.getByText(portfolio.profile.role)).toBeInTheDocument()
    portfolio.stats.forEach((s) => expect(screen.getByText(s.label)).toBeInTheDocument())
  })

  test('links into the world and to contact', () => {
    render(<Hero profile={portfolio.profile} stats={portfolio.stats} />)
    expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute('href', '#about')
    expect(screen.getByRole('link', { name: /get in touch/i })).toHaveAttribute('href', '#contact')
  })
})

describe('About', () => {
  test('renders the bio, every skill, awards and languages', () => {
    render(<About profile={portfolio.profile} skillGroups={portfolio.skillGroups} awards={portfolio.awards} />)
    expect(screen.getByText(portfolio.profile.bio[0]!)).toBeInTheDocument()
    portfolio.skillGroups.flatMap((g) => g.skills).forEach((s) => expect(screen.getByText(s)).toBeInTheDocument())
    portfolio.awards.forEach((a) => expect(screen.getByText(a.title)).toBeInTheDocument())
    expect(screen.getByText(portfolio.profile.languages.join(' · '))).toBeInTheDocument()
  })
})

describe('Journey', () => {
  test('renders one camera stop per milestone with its details', () => {
    const { container } = render(<Journey items={portfolio.journey} />)
    portfolio.journey.forEach((m, i) => {
      const stop = container.querySelector(`#${journeyStopId(i)}`) as HTMLElement
      expect(stop).not.toBeNull()
      expect(within(stop).getByRole('heading', { name: m.title })).toBeInTheDocument()
      expect(within(stop).getByText(m.org)).toBeInTheDocument()
    })
  })
})

describe('Projects', () => {
  test('lists every project as a button that focuses its screen', () => {
    render(<Projects items={portfolio.projects} />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(portfolio.projects[2]!.title) }))
    expect(useWorld.getState().focusedProject).toBe(2)
  })

  test('highlights the matching screen on hover and focus', () => {
    render(<Projects items={portfolio.projects} />)
    const button = screen.getByRole('button', { name: new RegExp(portfolio.projects[1]!.title) })
    fireEvent.pointerEnter(button)
    expect(useWorld.getState().hoveredProject).toBe(1)
    fireEvent.pointerLeave(button)
    expect(useWorld.getState().hoveredProject).toBeNull()
    fireEvent.focus(button)
    expect(useWorld.getState().hoveredProject).toBe(1)
    fireEvent.blur(button)
    expect(useWorld.getState().hoveredProject).toBeNull()
  })
})

describe('ProjectModal', () => {
  const projects = portfolio.projects

  test('renders nothing while no project is focused', () => {
    render(<ProjectModal projects={projects} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('shows the focused project with safe external links', () => {
    useWorld.getState().focusProject(2)
    render(<ProjectModal projects={projects} />)
    const dialog = screen.getByRole('dialog', { name: projects[2]!.title })
    expect(within(dialog).getByText(projects[2]!.impact)).toBeInTheDocument()
    const repo = within(dialog).getByRole('link', { name: /code/i })
    expect(repo).toHaveAttribute('href', projects[2]!.repoUrl)
    expect(repo).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('steps to the next and previous project, wrapping around', () => {
    useWorld.getState().focusProject(projects.length - 1)
    render(<ProjectModal projects={projects} />)
    fireEvent.click(screen.getByRole('button', { name: /next project/i }))
    expect(useWorld.getState().focusedProject).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: /previous project/i }))
    expect(useWorld.getState().focusedProject).toBe(projects.length - 1)
  })

  test('closes with the close button and with Escape', () => {
    useWorld.getState().focusProject(0)
    const { rerender } = render(<ProjectModal projects={projects} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(useWorld.getState().focusedProject).toBeNull()

    useWorld.getState().focusProject(1)
    rerender(<ProjectModal projects={projects} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useWorld.getState().focusedProject).toBeNull()
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
    expect(screen.queryByRole('link', { name: /résumé/i })).not.toBeInTheDocument()
    rerender(<Contact profile={{ ...portfolio.profile, resumeUrl: '/resume.pdf' }} />)
    expect(screen.getByRole('link', { name: /résumé/i })).toHaveAttribute('href', '/resume.pdf')
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
