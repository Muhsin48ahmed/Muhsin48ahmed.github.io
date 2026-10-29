import { SECTIONS, sectionForStop } from '../content/sections'
import { useWorld } from '../world/store'
import { SoundToggle } from './SoundToggle'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function Nav({ name, journeyCount }: { name: string; journeyCount: number }) {
  const active = useWorld((s) => sectionForStop(s.activeStop, journeyCount))

  return (
    <header className="fixed inset-x-0 top-0 z-30">
      <div className="scroll-progress h-px bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-10 sm:py-4">
        <a
          href="#hero"
          aria-label={`${name} — back to top`}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] font-display text-sm font-bold text-white backdrop-blur-xl sm:size-10"
        >
          {initials(name)}
        </a>
        <ul className="flex min-w-0 items-center overflow-x-auto rounded-full border border-line bg-white/[0.04] p-1 text-[11px] backdrop-blur-xl [scrollbar-width:none] sm:text-sm">
          {SECTIONS.slice(1).map((section) => {
            const isActive = section.id === active
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`block rounded-full px-2.5 py-1.5 whitespace-nowrap transition sm:px-4 ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {section.label}
                </a>
              </li>
            )
          })}
        </ul>
        <SoundToggle />
      </nav>
    </header>
  )
}
