import { act, fireEvent, render, screen } from '@testing-library/react'
import { useWorld } from '../world/store'
import { Cursor } from './Cursor'
import { Loader } from './Loader'

const initial = useWorld.getState()
afterEach(() => {
  useWorld.setState(initial, true)
  vi.unstubAllGlobals()
  vi.useRealTimers()
  document.documentElement.classList.remove('has-custom-cursor')
})

describe('Loader', () => {
  test('shows a progress indicator until the world has loaded, then fades out', () => {
    vi.useFakeTimers()
    render(<Loader />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    act(() => useWorld.getState().markLoaded())
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  test('gives up waiting after a timeout so the page is never blocked', () => {
    vi.useFakeTimers()
    render(<Loader />)
    act(() => vi.advanceTimersByTime(20000))
    expect(useWorld.getState().isLoaded).toBe(true)
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})

describe('Cursor', () => {
  const stubPointer = (isFine: boolean) =>
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: isFine, addEventListener() {}, removeEventListener() {} })))

  test('stays off on touch devices', () => {
    stubPointer(false)
    const { container } = render(<Cursor />)
    expect(container).toBeEmptyDOMElement()
  })

  test('follows the pointer and grows over links on mouse devices', () => {
    stubPointer(true)
    const { container, unmount } = render(
      <>
        <Cursor />
        <a href="#x">link</a>
      </>,
    )
    expect(document.documentElement).toHaveClass('has-custom-cursor')
    const ring = container.querySelector('[data-cursor="ring"]') as HTMLElement
    fireEvent.pointerOver(screen.getByText('link'))
    expect(ring.dataset.mode).toBe('hover')
    fireEvent.pointerMove(window, { clientX: 40, clientY: 50 })
    expect((container.querySelector('[data-cursor="dot"]') as HTMLElement).style.transform).toContain('40px')
    unmount()
    expect(document.documentElement).not.toHaveClass('has-custom-cursor')
  })
})
