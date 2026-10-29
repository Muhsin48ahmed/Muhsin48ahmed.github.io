import { useEffect, useRef, type RefObject } from 'react'
import { sectionProgress } from '../world/morph'

/**
 * Fractional index of the camera stop under the middle of the viewport.
 * Returned as a ref (not state) so scrolling never re-renders React — the 3D world reads it every frame.
 */
export function useStopProgress(ids: readonly string[]): RefObject<number> {
  const progress = useRef(0)

  useEffect(() => {
    const update = () => {
      const tops = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
        .map((el) => el.getBoundingClientRect().top + window.scrollY)
      const readingLine = window.scrollY + window.innerHeight / 2
      progress.current = sectionProgress(tops, document.documentElement.scrollHeight, readingLine)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids])

  return progress
}
