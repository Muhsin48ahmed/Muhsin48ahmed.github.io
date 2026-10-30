import { useEffect, useState } from 'react'

/**
 * Latches to true the first time `trigger` is true, or after `fallbackMs` if given, and stays true.
 * Used to defer heavy 3D assets until they are about to be needed.
 */
export function useEventually(trigger: boolean, fallbackMs?: number): boolean {
  const [hasFired, setHasFired] = useState(trigger)

  if (trigger && !hasFired) setHasFired(true)

  useEffect(() => {
    if (hasFired || fallbackMs === undefined) return
    const timer = setTimeout(() => setHasFired(true), fallbackMs)
    return () => clearTimeout(timer)
  }, [hasFired, fallbackMs])

  return hasFired
}
