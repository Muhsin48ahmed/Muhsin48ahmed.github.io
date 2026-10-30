import { useEffect, useState } from 'react'
import { useWorld } from '../world/store'

/** Show the page after this long even if the 3D world is still loading; it fades in behind the text. */
const MAX_WAIT_MS = 3500
const FADE_MS = 900
const TICK_MS = 120
const CREEP_TARGET = 90

export function Loader() {
  const isLoaded = useWorld((s) => s.isLoaded)
  const markLoaded = useWorld((s) => s.markLoaded)
  const [progress, setProgress] = useState(0)
  const [isGone, setIsGone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(markLoaded, MAX_WAIT_MS)
    return () => clearTimeout(timer)
  }, [markLoaded])

  useEffect(() => {
    if (isLoaded) {
      setProgress(100)
      const timer = setTimeout(() => setIsGone(true), FADE_MS)
      return () => clearTimeout(timer)
    }
    // three.js loads as one chunk, so creep toward 90% and jump to 100% when the world reports in.
    const interval = setInterval(() => setProgress((p) => p + (CREEP_TARGET - p) * 0.08), TICK_MS)
    return () => clearInterval(interval)
  }, [isLoaded])

  if (isGone) return null

  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-ink transition-opacity duration-700 ${isLoaded ? 'pointer-events-none opacity-0' : ''}`}
    >
      <div
        role="progressbar"
        aria-label="Loading the 3D world"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="w-64 text-center"
      >
        <p className="font-display text-7xl font-bold text-white tabular-nums">{Math.round(progress)}</p>
        <div className="mt-6 h-px w-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.3em] text-dim uppercase">initialising neural core</p>
      </div>
      <a
        href="./?view=classic"
        className="absolute bottom-10 font-mono text-[11px] tracking-[0.15em] text-dim uppercase underline-offset-4 hover:text-white hover:underline"
      >
        Skip to classic view →
      </a>
    </div>
  )
}
