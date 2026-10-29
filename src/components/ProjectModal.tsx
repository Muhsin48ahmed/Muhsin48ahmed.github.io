import { useEffect, useRef } from 'react'
import type { Project } from '../content/types'
import { useWorld } from '../world/store'

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn border border-line text-white hover:border-neon-cyan">
      {children} ↗
    </a>
  )
}

/** Side sheet for the project the camera has flown to. */
export function ProjectModal({ projects }: { projects: Project[] }) {
  const index = useWorld((s) => s.focusedProject)
  const focusProject = useWorld((s) => s.focusProject)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (index === null) return
    closeButton.current?.focus()
    const step = (delta: number) => focusProject((index + delta + projects.length) % projects.length)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') focusProject(null)
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index, projects.length, focusProject])

  const project = index === null ? undefined : projects[index]
  if (index === null || !project) return null
  const step = (delta: number) => focusProject((index + delta + projects.length) % projects.length)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-dialog-title"
      className="panel fixed inset-x-3 bottom-3 z-40 max-h-[70svh] overflow-y-auto p-6 sm:inset-x-auto sm:top-24 sm:bottom-auto sm:left-10 sm:max-h-[calc(100svh-8rem)] sm:w-[26rem] sm:p-8"
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} · {project.category}
        </p>
        <button
          ref={closeButton}
          type="button"
          onClick={() => focusProject(null)}
          aria-label="Close project"
          className="grid size-9 place-items-center rounded-full border border-line text-slate-300 hover:text-white"
        >
          ✕
        </button>
      </div>
      <h3 id="project-dialog-title" className="mt-4 font-display text-3xl font-bold text-white">
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
      <div className="mt-8 flex justify-between border-t border-line pt-4 font-mono text-xs">
        <button type="button" onClick={() => step(-1)} aria-label="Previous project" className="text-slate-400 hover:text-white">
          ← prev
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Next project" className="text-slate-400 hover:text-white">
          next →
        </button>
      </div>
    </div>
  )
}
