import { useEffect } from 'react'
import { useWorld } from '../world/store'
import { soundscape } from './soundscape'

const CLICKABLE = 'a, button'

/** Plays blips for hovers over 3D objects, clicks on controls, and opening a project. */
export function useSoundEvents() {
  useEffect(() => {
    const unsubscribe = useWorld.subscribe((state, previous) => {
      if (state.cursor !== 'default' && previous.cursor === 'default') soundscape.blip('hover')
      if (state.focusedProject !== null && previous.focusedProject === null) soundscape.blip('open')
    })
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.(CLICKABLE)) soundscape.blip('click')
    }
    document.addEventListener('click', onClick)
    return () => {
      unsubscribe()
      document.removeEventListener('click', onClick)
    }
  }, [])
}
