import type { Project } from '../content/types'
import { getViewMode } from '../content/viewMode'
import { useWorld } from '../world/store'
import { ProjectDetails } from './ProjectDetails'
import { SectionHeader } from './SectionHeader'

const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

/** Classic view: every project's full write-up, charts and lab inline. */
function ProjectCards({ items }: { items: Project[] }) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative px-5 py-20 sm:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeader id="projects" title="Selected work" />
        <div className="grid gap-5 lg:grid-cols-2">
          {items.map((project, i) => (
            <article key={project.title} data-reveal aria-labelledby={`project-${slug(project.title)}`} className="panel p-6 sm:p-8">
              <p className="eyebrow">
                {String(i + 1).padStart(2, '0')} · {project.category}
              </p>
              <ProjectDetails project={project} titleId={`project-${slug(project.title)}`} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Projects({ items }: { items: Project[] }) {
  return getViewMode() === 'classic' ? <ProjectCards items={items} /> : <ProjectScreens items={items} />
}

/** Immersive view: a project picker under the 3D holo screens. */
function ProjectScreens({ items }: { items: Project[] }) {
  const focusProject = useWorld((s) => s.focusProject)
  const hoverProject = useWorld((s) => s.hoverProject)
  const isProjectOpen = useWorld((s) => s.focusedProject !== null)

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative flex min-h-[100svh] flex-col justify-between px-5 py-28 sm:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeader id="projects" title="Selected work" />
      </div>
      <div
        className={`mx-auto w-full max-w-7xl transition-opacity duration-500 ${isProjectOpen ? 'pointer-events-none opacity-0' : ''}`}
      >
        <p data-reveal className="mb-4 font-mono text-xs text-dim">
          Click a screen — or pick a project:
        </p>
        <ul data-reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((project, i) => (
            <li key={project.title}>
              <button
                type="button"
                onClick={() => focusProject(i)}
                onPointerEnter={() => hoverProject(i)}
                onPointerLeave={() => hoverProject(null)}
                onFocus={() => hoverProject(i)}
                onBlur={() => hoverProject(null)}
                className="panel group w-full p-4 text-left transition hover:-translate-y-1 hover:border-neon-cyan/50 focus-visible:outline-2 focus-visible:outline-neon-cyan"
              >
                <span className="block font-mono text-[11px] text-neon-lime">{project.impact}</span>
                <span className="mt-1 block font-display text-lg font-bold text-white">{project.title}</span>
                <span className="mt-1 block text-xs text-dim">{project.category}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
