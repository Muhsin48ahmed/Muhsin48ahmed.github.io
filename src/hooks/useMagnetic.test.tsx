import { renderHook } from '@testing-library/react'
import { useMagnetic } from './useMagnetic'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

const stubPointer = (isFine: boolean) =>
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: isFine, addEventListener() {}, removeEventListener() {} })))

function addButton() {
  const el = document.createElement('button')
  el.dataset.magnetic = ''
  el.getBoundingClientRect = () => ({ left: 100, top: 100, width: 200, height: 50 }) as DOMRect
  document.body.appendChild(el)
  return el
}

describe('useMagnetic', () => {
  test('leans buttons toward a nearby pointer and resets on unmount', () => {
    stubPointer(true)
    const el = addButton()
    const { unmount } = renderHook(() => useMagnetic())
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 240, clientY: 125 }))
    expect(el.style.transform).toMatch(/translate\(12\.0px, 0\.0px\)/)
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 900, clientY: 900 }))
    expect(el.style.transform).toBe('')
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 240, clientY: 125 }))
    unmount()
    expect(el.style.transform).toBe('')
  })

  test('does nothing on touch devices', () => {
    stubPointer(false)
    const el = addButton()
    renderHook(() => useMagnetic())
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 240, clientY: 125 }))
    expect(el.style.transform).toBe('')
  })
})
