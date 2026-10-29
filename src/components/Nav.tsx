import { SECTIONS } from '../content/sections'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function Nav({ name }: { name: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-line bg-ink/60 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <a
          href="#hero"
          aria-label={`${name} — back to top`}
          className="grid size-9 place-items-center rounded-lg border border-line font-mono text-sm text-neon-cyan"
        >
          {initials(name)}
        </a>
        <ul className="flex overflow-x-auto text-xs [scrollbar-width:none] sm:gap-2 sm:text-sm">
          {SECTIONS.slice(1).map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-full px-2.5 py-1.5 whitespace-nowrap sm:px-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
