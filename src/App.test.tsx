import { render, screen } from '@testing-library/react'
import App from './App'
import { portfolio } from './content/portfolio'
import { SECTIONS, cameraStopIds } from './content/sections'

vi.mock('./world/World', () => ({ default: () => <div data-testid="world" /> }))
vi.mock('lenis', () => ({
  default: class {
    stop() {}
    start() {}
    destroy() {}
  },
}))

describe('App', () => {
  test('renders every section in order', () => {
    const { container } = render(<App />)
    const ids = Array.from(container.querySelectorAll('main > section')).map((s) => s.id)
    expect(ids).toEqual(SECTIONS.map((s) => s.id))
  })

  test('has a DOM element for every camera stop', () => {
    render(<App />)
    cameraStopIds(portfolio.journey.length).forEach((id) => expect(document.getElementById(id)).not.toBeNull())
  })

  test('mounts the 3D world', async () => {
    render(<App />)
    expect(await screen.findByTestId('world')).toBeInTheDocument()
  })
})
