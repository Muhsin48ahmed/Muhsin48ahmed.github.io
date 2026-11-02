import { Fragment } from 'react'
import { SECTIONS, captionFor, type SectionId } from '../content/sections'
import { getViewMode } from '../content/viewMode'

export function SectionHeader({ id, title }: { id: SectionId; title: string }) {
  const number = String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0')
  return (
    <header data-reveal className="mb-10">
      <p className="eyebrow">
        {number}{' '}
        <span className="text-dim">
          — {getViewMode() === 'classic' ? SECTIONS.find((s) => s.id === id)!.label : captionFor(id).replace(/^zone \d+ — /, '')}
        </span>
      </p>
      <h2 id={`${id}-title`} className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
        {title.split(' ').map((word, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span className="word" style={{ '--i': i } as React.CSSProperties}>
                {word}
              </span>
            </span>
          </Fragment>
        ))}
      </h2>
    </header>
  )
}
