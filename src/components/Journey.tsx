import type { Milestone } from '../content/types'
import { journeyStopId } from '../content/sections'
import { SectionHeader } from './SectionHeader'

function MilestoneCard({ milestone, index, total }: { milestone: Milestone; index: number; total: number }) {
  return (
    <article data-reveal className="panel max-w-xl p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-xs text-neon-cyan">{milestone.period}</span>
        <span className="chip">
          {milestone.kind === 'work' ? 'work' : 'education'} · {String(index + 1).padStart(2, '0')}/
          {String(total).padStart(2, '0')}
        </span>
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">{milestone.title}</h3>
      <p className="mt-1 text-neon-violet">{milestone.org}</p>
      <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-400">
        {milestone.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-3">
            <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-neon-cyan" />
            {highlight}
          </li>
        ))}
      </ul>
      <ul className="mt-6 flex flex-wrap gap-1.5">
        {milestone.stack.map((tech) => (
          <li key={tech} className="chip">
            {tech}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function Journey({ items }: { items: Milestone[] }) {
  return (
    <section id="journey" aria-labelledby="journey-title" className="relative px-5 sm:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {items.map((milestone, i) => (
          <div key={`${milestone.org}-${milestone.period}`} id={journeyStopId(i)} className="flex min-h-[100svh] flex-col justify-center py-24">
            {i === 0 && <SectionHeader id="journey" title="The journey" />}
            <MilestoneCard milestone={milestone} index={i} total={items.length} />
          </div>
        ))}
      </div>
    </section>
  )
}
