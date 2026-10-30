import { act, renderHook } from '@testing-library/react'
import { useEventually } from './useEventually'

afterEach(() => vi.useRealTimers())

describe('useEventually', () => {
  test('stays false until the trigger fires, then latches true', () => {
    const { result, rerender } = renderHook(({ trigger }) => useEventually(trigger), { initialProps: { trigger: false } })
    expect(result.current).toBe(false)
    rerender({ trigger: true })
    expect(result.current).toBe(true)
    rerender({ trigger: false })
    expect(result.current).toBe(true)
  })

  test('also turns true on its own after the fallback delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useEventually(false, 3000))
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(2999))
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  test('does not start the fallback timer while delay is undefined', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useEventually(false))
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current).toBe(false)
  })
})
