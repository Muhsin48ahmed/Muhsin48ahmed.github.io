import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { portfolio } from '../content/portfolio'
import { useWorld } from '../world/store'
import { ContactForm } from './ContactForm'
import { Cursor } from './Cursor'
import { Nav } from './Nav'
import { SurgeLab } from './SurgeLab'
import { ZoneRail } from './ZoneRail'

const initialWorld = useWorld.getState()
afterEach(() => {
  useWorld.setState(initialWorld, true)
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  document.documentElement.classList.remove('has-custom-cursor')
})

describe('Nav active section', () => {
  test('marks the section the camera is in with aria-current', () => {
    useWorld.getState().setActiveStop(2) // first journey stop
    render(<Nav name="Muhsin Ahmed" journeyCount={portfolio.journey.length} />)
    expect(screen.getByRole('link', { name: 'Journey' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  test('has a sound toggle that starts off', () => {
    render(<Nav name="Muhsin Ahmed" journeyCount={1} />)
    expect(screen.getByRole('switch', { name: /sound/i })).toHaveAttribute('aria-checked', 'false')
  })
})

describe('ZoneRail', () => {
  test('lists every zone and highlights the active one', () => {
    useWorld.getState().setActiveStop(1)
    render(<ZoneRail journeyCount={2} />)
    const rail = screen.getByRole('navigation', { name: /zones/i })
    const links = within(rail).getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['#hero', '#about', '#journey', '#projects', '#contact'])
    expect(links[1]).toHaveAttribute('aria-current', 'location')
  })
})

describe('Cursor labels', () => {
  test('shows the world label inside the ring while over a 3D object', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })))
    const { container } = render(<Cursor />)
    act(() => useWorld.getState().setCursor('grab', 'drag'))
    expect(container.querySelector('[data-cursor="label"]')).toHaveTextContent('drag')
    act(() => useWorld.getState().setCursor('default'))
    expect(container.querySelector('[data-cursor="label"]')).toHaveTextContent('')
  })
})

describe('SurgeLab', () => {
  test('estimates a probability from the controls and publishes it to the world', () => {
    render(<SurgeLab />)
    const hour = screen.getByRole('slider', { name: /hour/i })
    fireEvent.change(hour, { target: { value: '19' } })
    fireEvent.click(screen.getByRole('switch', { name: /rain/i }))
    fireEvent.change(screen.getByRole('combobox', { name: /zone/i }), { target: { value: 'cbd' } })
    const output = screen.getByRole('status')
    expect(output).toHaveTextContent(/\d+%/)
    expect(useWorld.getState().surgeProbability).toBeGreaterThan(0.5)
    expect(screen.getByText(/evening peak/i)).toBeInTheDocument()
  })

  test('clears the published probability on unmount', () => {
    const { unmount } = render(<SurgeLab />)
    expect(useWorld.getState().surgeProbability).not.toBeNull()
    unmount()
    expect(useWorld.getState().surgeProbability).toBeNull()
  })
})

describe('ContactForm', () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Ada' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello there, I have a role for you.' } })
  }

  test('shows validation errors and does not submit an empty form', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<ContactForm to="me@example.com" formId="abc" />)
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('submits through Formspree and shows a confirmation', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<ContactForm to="me@example.com" formId="abc" />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('shows the error when sending fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))
    render(<ContactForm to="me@example.com" formId="abc" />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be sent/i)
  })

  test('falls back to an email draft when no form service is configured', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })
    render(<ContactForm to="me@example.com" formId="" />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(assign).toHaveBeenCalledWith(expect.stringMatching(/^mailto:me@example\.com\?/))
  })
})
