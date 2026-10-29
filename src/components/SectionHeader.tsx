import { SECTIONS, captionFor, type SectionId } from '../content/sections'

export function SectionHeader({ id, title }: { id: SectionId; title: string }) {
  const number = String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0')
  return (
    <header data-reveal className="mb-10">
      <p className="eyebrow">
        {number} <span className="text-slate-500">— {captionFor(id).replace(/^zone \d+ — /, '')}</span>
      </p>
      <h2 id={`${id}-title`} className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
        {title}
      </h2>
    </header>
  )
}
