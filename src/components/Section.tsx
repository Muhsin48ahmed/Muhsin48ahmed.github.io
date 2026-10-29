import type { ReactNode } from 'react'
import { SECTION_IDS, figureFor, type SectionId } from '../content/sections'

interface SectionProps {
  id: SectionId
  title?: string
  /** Use the full content width instead of leaving the right side to the 3D scene. */
  isWide?: boolean
  children: ReactNode
}

export function Section({ id, title, isWide = false, children }: SectionProps) {
  const number = String(SECTION_IDS.indexOf(id) + 1).padStart(2, '0')
  const titleId = `${id}-title`

  return (
    <section
      id={id}
      aria-labelledby={title ? titleId : undefined}
      className="relative flex min-h-screen items-center px-4 py-24 sm:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className={isWide ? '' : 'lg:max-w-[55%]'}>
          {title && (
            <header className="mb-10">
              <p className="font-mono text-xs text-neon-cyan">{number} /</p>
              <h2 id={titleId} className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h2>
            </header>
          )}
          {children}
        </div>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-6 font-mono text-[11px] tracking-wide text-slate-500 sm:right-8"
      >
        {figureFor(id)}
      </p>
    </section>
  )
}
