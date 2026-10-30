import { act, renderHook } from '@testing-library/react'
import { useWorld } from '../world/store'
import { useActiveStopSync } from './useActiveStopSync'

const initial = useWorld.getState()
afterEach(() => useWorld.setState(initial, true))

describe('useActiveStopSync', () => {
  test('mirrors scroll progress into the active stop when enabled', () => {
    const progress = { current: 0.5 }
    renderHook(() => useActiveStopSync(progress, 5, true))
    expect(useWorld.getState().activeStop).toBe(0)

    progress.current = 3.6
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(useWorld.getState().activeStop).toBe(3)
  })

  test('picks the section under the reading line, not the nearest boundary', () => {
    const progress = { current: 2.3 }
    renderHook(() => useActiveStopSync(progress, 5, true))
    expect(useWorld.getState().activeStop).toBe(2)
  })

  test('marks the last section active once the page is scrolled to the bottom', () => {
    const progress = { current: 3.2 } // short last section never reaches the reading line
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    vi.stubGlobal('innerHeight', 1000)
    vi.stubGlobal('scrollY', 1000)
    renderHook(() => useActiveStopSync(progress, 5, true))
    expect(useWorld.getState().activeStop).toBe(4)
    vi.unstubAllGlobals()
  })

  test('clamps to the last stop', () => {
    const progress = { current: 99 }
    renderHook(() => useActiveStopSync(progress, 5, true))
    expect(useWorld.getState().activeStop).toBe(4)
  })

  test('does nothing when disabled (the 3D camera owns the active stop)', () => {
    const progress = { current: 3.6 }
    renderHook(() => useActiveStopSync(progress, 5, false))
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(useWorld.getState().activeStop).toBe(0)
  })
})
