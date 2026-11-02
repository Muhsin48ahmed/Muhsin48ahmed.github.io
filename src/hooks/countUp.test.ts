import { act, renderHook } from '@testing-library/react'
import { formatCount, parseStat } from './countUp'
import { useCountUp } from './useCountUp'

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('parseStat', () => {
  test('splits a stat into prefix, number and suffix', () => {
    expect(parseStat('53k+')).toEqual({ prefix: '', target: 53, decimals: 0, suffix: 'k+' })
    expect(parseStat('<2s')).toEqual({ prefix: '<', target: 2, decimals: 0, suffix: 's' })
    expect(parseStat('1.5x')).toEqual({ prefix: '', target: 1.5, decimals: 1, suffix: 'x' })
  })

  test('returns null when there is nothing safe to count', () => {
    expect(parseStat('N/A')).toBeNull()
    expect(parseStat('1,200')).toBeNull()
  })
})

describe('formatCount', () => {
  test('scales the number by progress and keeps the original text at the end', () => {
    const parts = parseStat('53k+')!
    expect(formatCount(parts, 0)).toBe('0k+')
    expect(formatCount(parts, 0.5)).toBe('27k+')
    expect(formatCount(parts, 1)).toBe('53k+')
    expect(formatCount(parseStat('1.5x')!, 1)).toBe('1.5x')
  })
})

describe('useCountUp', () => {
  test('counts from zero to the stat once active', () => {
    mockReducedMotion(false)
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ isActive }) => useCountUp('53k+', isActive, { durationMs: 1000 }), {
      initialProps: { isActive: false },
    })
    expect(result.current).toBe('0k+')

    rerender({ isActive: true })
    act(() => vi.advanceTimersByTime(300))
    const midway = parseInt(result.current, 10)
    expect(midway).toBeGreaterThan(0)
    expect(midway).toBeLessThan(53)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toBe('53k+')
  })

  test('waits for the delay before counting', () => {
    mockReducedMotion(false)
    vi.useFakeTimers()
    const { result } = renderHook(() => useCountUp('53k+', true, { delayMs: 500, durationMs: 1000 }))
    act(() => vi.advanceTimersByTime(400))
    expect(result.current).toBe('0k+')
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current).toBe('53k+')
  })

  test('shows the final value straight away with reduced motion', () => {
    mockReducedMotion(true)
    const { result } = renderHook(() => useCountUp('53k+', false))
    expect(result.current).toBe('53k+')
  })

  test('leaves small numbers alone, where counting would read as nonsense ("<0s")', () => {
    mockReducedMotion(false)
    const { result } = renderHook(() => useCountUp('<2s', false))
    expect(result.current).toBe('<2s')
  })

  test('shows stats it cannot count as they are', () => {
    mockReducedMotion(false)
    const { result } = renderHook(() => useCountUp('N/A', false))
    expect(result.current).toBe('N/A')
  })
})
