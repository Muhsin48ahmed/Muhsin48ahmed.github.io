import { act, renderHook } from '@testing-library/react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useSectionProgress } from './useSectionProgress'

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

describe('useSectionProgress', () => {
  function addSection(id: string, top: number) {
    const el = document.createElement('section')
    el.id = id
    Object.defineProperty(el, 'offsetTop', { value: top })
    document.body.appendChild(el)
  }

  test('tracks the section under the middle of the viewport', () => {
    addSection('a', 0)
    addSection('b', 1000)
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    vi.stubGlobal('innerHeight', 1000)
    vi.stubGlobal('scrollY', 0)

    const { result } = renderHook(() => useSectionProgress(['a', 'b']))
    expect(result.current.current).toBeCloseTo(0.5)

    vi.stubGlobal('scrollY', 1000)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.current).toBeCloseTo(1.5)
  })

  test('ignores section ids that are not on the page', () => {
    addSection('a', 0)
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true })
    vi.stubGlobal('innerHeight', 1000)
    vi.stubGlobal('scrollY', 0)
    const { result } = renderHook(() => useSectionProgress(['a', 'missing']))
    expect(result.current.current).toBeCloseTo(0.5)
  })
})
