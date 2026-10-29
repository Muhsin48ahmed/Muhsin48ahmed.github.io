import { useEffect } from 'react'

const VISIBLE_THRESHOLD = 0.15

/** Fades `[data-reveal]` elements in the first time they scroll into view (styles in index.css). */
export function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const show = (el: HTMLElement) => {
      el.dataset.visible = 'true'
    }
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(show)
      return
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry) => {
            show(entry.target as HTMLElement)
            observer.unobserve(entry.target)
          }),
      { threshold: VISIBLE_THRESHOLD },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
