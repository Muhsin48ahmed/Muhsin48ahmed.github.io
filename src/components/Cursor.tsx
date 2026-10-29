import { useEffect, useRef, useState } from 'react'
import { useWorld } from '../world/store'

const FOLLOW_EASE = 0.18
const INTERACTIVE = 'a, button, [role="button"]'

const hasFinePointer = () => typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches

/** Dot + trailing ring that reacts to links and to grabbable 3D objects. Mouse devices only. */
export function Cursor() {
  const [isEnabled] = useState(hasFinePointer)
  const [isOverLink, setIsOverLink] = useState(false)
  const worldMode = useWorld((s) => s.cursor)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEnabled) return
    const root = document.documentElement
    root.classList.add('has-custom-cursor')
    const target = { x: -100, y: -100 }
    const trail = { ...target }
    let frame = 0

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
    }
    const onOver = (event: PointerEvent) => setIsOverLink(Boolean((event.target as Element).closest?.(INTERACTIVE)))
    const follow = () => {
      trail.x += (target.x - trail.x) * FOLLOW_EASE
      trail.y += (target.y - trail.y) * FOLLOW_EASE
      if (ring.current) ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`
      frame = requestAnimationFrame(follow)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    frame = requestAnimationFrame(follow)
    return () => {
      root.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      cancelAnimationFrame(frame)
    }
  }, [isEnabled])

  if (!isEnabled) return null
  return (
    <>
      <div ref={ring} data-cursor="ring" data-mode={isOverLink ? 'hover' : worldMode} aria-hidden="true" />
      <div ref={dot} data-cursor="dot" aria-hidden="true" />
    </>
  )
}
