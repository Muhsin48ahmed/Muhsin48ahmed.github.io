import { useEffect, useMemo, useState } from 'react'
import { easeOutExpo, formatCount, parseStat } from './countUp'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const DEFAULT_DURATION_MS = 1600
// Below this, counting only flashes meaningless values ("<0s", "<1s") before the real one.
const MIN_COUNT_TARGET = 10

interface CountUpOptions {
  delayMs?: number
  durationMs?: number
}

/** Counts a stat like "53k+" up from zero once `isActive` turns true. Text that isn't a plain number shows as is. */
export function useCountUp(value: string, isActive: boolean, { delayMs = 0, durationMs = DEFAULT_DURATION_MS }: CountUpOptions = {}) {
  const parts = useMemo(() => parseStat(value), [value])
  const isReduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const shouldAnimate = parts !== null && parts.target >= MIN_COUNT_TARGET && !isReduced

  useEffect(() => {
    if (!shouldAnimate || !isActive) return
    let frame = 0
    let start: number | null = null
    const tick = (now: number) => {
      start ??= now
      const t = Math.min((now - start) / durationMs, 1)
      setProgress(easeOutExpo(t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick)
    }, delayMs)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [shouldAnimate, isActive, delayMs, durationMs])

  return parts && shouldAnimate ? formatCount(parts, progress) : value
}
