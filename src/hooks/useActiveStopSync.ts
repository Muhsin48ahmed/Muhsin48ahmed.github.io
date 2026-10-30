import { useEffect, type RefObject } from 'react'
import { useWorld } from '../world/store'

/** Within this many px of the end of the page counts as scrolled to the bottom. */
const BOTTOM_SLACK_PX = 4

/**
 * In the classic view there is no 3D camera to report the active stop, so derive it from scroll progress
 * (the same rounding CameraRig uses). Classic sections can be shorter than half the viewport, so the last
 * one may never reach the reading line: being scrolled to the bottom selects it too.
 */
export function useActiveStopSync(progress: RefObject<number>, stopCount: number, isEnabled: boolean) {
  useEffect(() => {
    if (!isEnabled) return
    const { setActiveStop } = useWorld.getState()
    const sync = () => {
      const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_SLACK_PX
      const fromProgress = Math.round(Math.min(Math.max(progress.current - 0.5, 0), stopCount - 1))
      setActiveStop(isAtBottom && window.scrollY > 0 ? stopCount - 1 : fromProgress)
    }
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [progress, stopCount, isEnabled])
}
