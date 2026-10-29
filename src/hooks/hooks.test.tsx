import { act, renderHook } from '@testing-library/react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useReveal } from './useReveal'
import { useStopProgress } from './useStopProgress'

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>()
  const mql = {
    matches,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mql))
  return { emit: (next: boolean) => listeners.forEach((cb) => cb({ matches: next })), listeners }
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('usePrefersReducedMotion', () => {
  test('reflects the media query and updates on change', () => {
    const media = mockMatchMedia(false)
    const { result, unmount } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
    act(() => media.emit(true))
    expect(result.current).toBe(true)
    unmount()
    expect(media.listeners.size).toBe(0)
  })

  test('defaults to false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })
})

describe('useStopProgress', () => {
  function addStop(id: string, viewportTop: number) {
    const el = document.createElement('div')
    el.id = id
    el.getBoundingClientRect = () => ({ top: viewportTop }) as DOMRect
    document.body.appendChild(el)
    return el
  }

  test('tracks the stop under the middle of the viewport', () => {
    const a = addStop('a', 0)
    const b = addStop('b', 1000)
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    vi.stubGlobal('innerHeight', 1000)
    vi.stubGlobal('scrollY', 0)

    const { result } = renderHook(() => useStopProgress(['a', 'b']))
    expect(result.current.current).toBeCloseTo(0.5)

    vi.stubGlobal('scrollY', 1000)
    a.getBoundingClientRect = () => ({ top: -1000 }) as DOMRect
    b.getBoundingClientRect = () => ({ top: 0 }) as DOMRect
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.current).toBeCloseTo(1.5)
  })

  test('ignores ids that are not on the page', () => {
    addStop('a', 0)
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true })
    vi.stubGlobal('innerHeight', 1000)
    vi.stubGlobal('scrollY', 0)
    const { result } = renderHook(() => useStopProgress(['a', 'missing']))
    expect(result.current.current).toBeCloseTo(0.5)
  })
})

describe('useReveal', () => {
  test('marks elements visible once they scroll into view', () => {
    let callback: IntersectionObserverCallback = () => {}
    const unobserve = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (this: unknown, cb: IntersectionObserverCallback) {
        callback = cb
        return { observe: vi.fn(), unobserve, disconnect: vi.fn() }
      }),
    )
    const el = document.createElement('div')
    el.dataset.reveal = ''
    document.body.appendChild(el)

    renderHook(() => useReveal())
    act(() => callback([{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver))

    expect(el.dataset.visible).toBe('true')
    expect(unobserve).toHaveBeenCalledWith(el)
  })

  test('shows everything immediately without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const el = document.createElement('div')
    el.dataset.reveal = ''
    document.body.appendChild(el)
    renderHook(() => useReveal())
    expect(el.dataset.visible).toBe('true')
  })
})
