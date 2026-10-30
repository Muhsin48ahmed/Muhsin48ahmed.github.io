import type { Project } from '../content/types'
import { SurgeLab } from './SurgeLab'

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn border border-line text-white hover:border-neon-cyan">
      {children} ↗
    </a>
  )
}

/** A project's full write-up: shared by the 3D close-up sheet and the classic view's cards. */
export function ProjectDetails({ project, titleId }: { project: Project; titleId: string }) {
  return (
    <>
      <h3 id={titleId} className="mt-4 font-display text-3xl font-bold text-white">
        {project.title}
      </h3>
      <p className="mt-2 font-mono text-sm text-neon-lime">{project.impact}</p>
      <p className="mt-4 leading-relaxed text-slate-400">{project.summary}</p>
      <ul className="mt-5 space-y-2 text-sm text-slate-300">
        {project.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-3">
            <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-neon-cyan" />
            {highlight}
          </li>
        ))}
      </ul>
      {project.charts && project.charts.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-2">
          {project.charts.map((chart, i) => (
            <li key={chart.src} className={i === 0 ? 'col-span-2' : ''}>
              <img
                src={chart.src}
                alt={chart.alt}
                width={chart.width}
                height={chart.height}
                loading="lazy"
                className="h-auto w-full rounded-xl border border-line bg-white/[0.03]"
              />
            </li>
          ))}
        </ul>
      )}
      {project.lab === 'surge' && <SurgeLab />}
      <ul className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <li key={tech} className="chip">
            {tech}
          </li>
        ))}
      </ul>
      {(project.repoUrl || project.demoUrl) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {project.repoUrl && <ExternalLink href={project.repoUrl}>Code</ExternalLink>}
          {project.demoUrl && <ExternalLink href={project.demoUrl}>Live demo</ExternalLink>}
        </div>
      )}
    </>
  )
}
