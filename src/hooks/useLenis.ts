import Lenis from 'lenis'
import { useEffect } from 'react'
import { useWorld } from '../world/store'

const SMOOTHING = 0.09

/** Inertia scrolling; paused while a project is open so arrow keys and the wheel stay with the dialog. */
export function useLenis(isEnabled: boolean) {
  useEffect(() => {
    if (!isEnabled) return
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: SMOOTHING })
    const unsubscribe = useWorld.subscribe((state, previous) => {
      if (state.focusedProject === previous.focusedProject) return
      if (state.focusedProject === null) lenis.start()
      else lenis.stop()
    })
    return () => {
      unsubscribe()
      lenis.destroy()
    }
  }, [isEnabled])
}
