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
    <header className="fixed inset-x-0 top-0 z-30">
      <div className="scroll-progress h-px bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-10">
        <a
          href="#hero"
          aria-label={`${name} — back to top`}
          className="grid size-10 place-items-center rounded-xl border border-line bg-white/[0.04] font-display text-sm font-bold text-white backdrop-blur-xl"
        >
          {initials(name)}
        </a>
        <ul className="flex items-center overflow-x-auto rounded-full border border-line bg-white/[0.04] p-1 text-xs backdrop-blur-xl [scrollbar-width:none] sm:text-sm">
          {SECTIONS.slice(1).map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-full px-3 py-1.5 whitespace-nowrap text-slate-400 transition hover:bg-white/10 hover:text-white sm:px-4"
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
