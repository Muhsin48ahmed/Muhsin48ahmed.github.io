import type { Experience as Job } from '../content/types'
import { Section } from './Section'

export function Experience({ items }: { items: Job[] }) {
  return (
    <Section id="experience" title="Experience">
      <ol className="relative space-y-6 border-l border-line pl-6">
        {items.map((job) => (
          <li key={`${job.company}-${job.period}`} aria-label={`${job.role} at ${job.company}`} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-6 -left-[29px] size-2.5 rounded-full bg-neon-cyan shadow-[0_0_12px] shadow-neon-cyan"
            />
            <article className="panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold text-white">{job.role}</h3>
                <p className="font-mono text-xs text-slate-500">{job.period}</p>
              </div>
              <p className="text-sm text-neon-violet">{job.company}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-slate-400 marker:text-slate-600">
                {job.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <ul className="mt-4 flex flex-wrap gap-2">
                {job.stack.map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </Section>
  )
}
