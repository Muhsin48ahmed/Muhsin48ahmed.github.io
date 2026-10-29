import type { Project } from '../content/types'
import { Section } from './Section'

function ExternalLink({ href, label, children }: { href: string; label: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="font-mono text-xs text-neon-cyan underline-offset-4 hover:underline"
    >
      {children} ↗
    </a>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const titleId = `project-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <article aria-labelledby={titleId} className="panel flex flex-col p-6 transition hover:border-neon-cyan/40">
      <p className="font-mono text-xs text-neon-lime">{project.impact}</p>
      <h3 id={titleId} className="mt-2 text-xl font-semibold text-white">
        {project.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{project.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li key={tech} className="chip">
            {tech}
          </li>
        ))}
      </ul>
      {(project.repoUrl || project.demoUrl) && (
        <div className="mt-5 flex gap-5">
          {project.repoUrl && (
            <ExternalLink href={project.repoUrl} label={`${project.title} source code`}>
              Code
            </ExternalLink>
          )}
          {project.demoUrl && (
            <ExternalLink href={project.demoUrl} label={`${project.title} live demo`}>
              Live demo
            </ExternalLink>
          )}
        </div>
      )}
    </article>
  )
}

export function Projects({ items }: { items: Project[] }) {
  return (
    <Section id="projects" title="Selected projects" isWide>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </Section>
  )
}
