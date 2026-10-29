import { useEffect } from 'react'
import { magneticOffset } from './magnetic'

const hasFinePointer = () => typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches

/** Elements with `data-magnetic` lean toward the pointer when it comes near. Mouse devices only. */
export function useMagnetic() {
  useEffect(() => {
    if (!hasFinePointer()) return
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    const onMove = (event: PointerEvent) => {
      for (const el of elements) {
        const { x, y } = magneticOffset({ x: event.clientX, y: event.clientY }, el.getBoundingClientRect())
        el.style.transform = x || y ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` : ''
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      elements.forEach((el) => (el.style.transform = ''))
    }
  }, [])
}
