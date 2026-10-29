import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const hasMatchMedia = () => typeof window.matchMedia === 'function'

export function usePrefersReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(() => hasMatchMedia() && window.matchMedia(QUERY).matches)

  useEffect(() => {
    if (!hasMatchMedia()) return
    const query = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return isReduced
}
