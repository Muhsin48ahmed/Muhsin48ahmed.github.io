import { render, screen } from '@testing-library/react'
import App from './App'
import { SECTIONS } from './content/sections'

vi.mock('./scene/Scene', () => ({ default: () => <div data-testid="scene" /> }))

describe('App', () => {
  test('renders every section in order with its figure caption', () => {
    const { container } = render(<App />)
    const ids = Array.from(container.querySelectorAll('main > section')).map((s) => s.id)
    expect(ids).toEqual(SECTIONS.map((s) => s.id))
    SECTIONS.forEach((s) => expect(screen.getByText(s.figure)).toBeInTheDocument())
  })

  test('mounts the 3D scene', async () => {
    render(<App />)
    expect(await screen.findByTestId('scene')).toBeInTheDocument()
  })
})
