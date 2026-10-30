import { fireEvent, render, screen, within } from '@testing-library/react'
import { portfolio } from '../content/portfolio'
import { useWorld } from '../world/store'
import { Hero } from './Hero'
import { Loader } from './Loader'
import { Nav } from './Nav'
import { Projects } from './Projects'

const initial = useWorld.getState()
const setView = (search: string) => window.history.replaceState(null, '', `/${search}`)
afterEach(() => {
  useWorld.setState(initial, true)
  setView('')
})

describe('immersive view links to the classic view', () => {
  test('from the hero', () => {
    render(<Hero profile={portfolio.profile} stats={portfolio.stats} />)
    expect(screen.getByRole('link', { name: /classic view/i })).toHaveAttribute('href', './?view=classic')
  })

  test('from the loader, so nobody has to wait for the 3D world', () => {
    render(<Loader />)
    expect(screen.getByRole('link', { name: /skip to classic view/i })).toHaveAttribute('href', './?view=classic')
  })

  test('keeps the sound toggle in the nav', () => {
    render(<Nav name="Muhsin Ahmed" journeyCount={1} />)
    expect(screen.getByRole('switch', { name: /sound/i })).toBeInTheDocument()
  })
})

describe('classic view', () => {
  beforeEach(() => setView('?view=classic'))

  test('the nav swaps the sound toggle for a link back to 3D', () => {
    render(<Nav name="Muhsin Ahmed" journeyCount={1} />)
    expect(screen.queryByRole('switch', { name: /sound/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /3d view/i })).toHaveAttribute('href', './')
  })

  test('the hero drops the 3D-only hints', () => {
    render(<Hero profile={portfolio.profile} stats={portfolio.stats} />)
    expect(screen.queryByText(/scroll to fly/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /classic view/i })).not.toBeInTheDocument()
  })

  test('projects show full details inline instead of opening a 3D close-up', () => {
    render(<Projects items={portfolio.projects} />)
    portfolio.projects.forEach((project) => {
      const card = screen.getByRole('article', { name: project.title })
      expect(within(card).getByText(project.summary)).toBeInTheDocument()
      project.charts?.forEach((chart) => expect(within(card).getByAltText(chart.alt)).toBeInTheDocument())
    })
    expect(screen.queryByText(/click a screen/i)).not.toBeInTheDocument()
  })

  test('the surge lab works inline', () => {
    render(<Projects items={portfolio.projects} />)
    const surge = portfolio.projects.find((p) => p.lab === 'surge')!
    const card = screen.getByRole('article', { name: surge.title })
    fireEvent.click(within(card).getByRole('switch', { name: 'Rain' }))
    expect(within(card).getByRole('status')).toHaveTextContent(/\d+%/)
  })
})
