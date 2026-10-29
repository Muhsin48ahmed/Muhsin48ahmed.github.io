import { act, renderHook } from '@testing-library/react'
import { useWorld } from '../world/store'
import { useLenis } from './useLenis'

const lenis = vi.hoisted(() => ({ stop: vi.fn(), start: vi.fn(), destroy: vi.fn(), created: vi.fn() }))
vi.mock('lenis', () => ({
  default: class {
    constructor(options: unknown) {
      lenis.created(options)
    }
    stop = lenis.stop
    start = lenis.start
    destroy = lenis.destroy
  },
}))

const initial = useWorld.getState()
afterEach(() => {
  useWorld.setState(initial, true)
  vi.clearAllMocks()
})

describe('useLenis', () => {
  test('does nothing when disabled (reduced motion)', () => {
    renderHook(() => useLenis(false))
    expect(lenis.created).not.toHaveBeenCalled()
  })

  test('pauses smooth scrolling while a project is open', () => {
    const { unmount } = renderHook(() => useLenis(true))
    act(() => useWorld.getState().focusProject(1))
    expect(lenis.stop).toHaveBeenCalledTimes(1)
    act(() => useWorld.getState().hoverProject(2))
    expect(lenis.stop).toHaveBeenCalledTimes(1)
    act(() => useWorld.getState().focusProject(null))
    expect(lenis.start).toHaveBeenCalledTimes(1)
    unmount()
    expect(lenis.destroy).toHaveBeenCalled()
  })
})
