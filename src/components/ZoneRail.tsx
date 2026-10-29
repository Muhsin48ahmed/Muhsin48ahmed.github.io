import { SECTIONS, sectionForStop } from '../content/sections'
import { useWorld } from '../world/store'

/** Slim vertical rail on the right: one dot per zone, the current one lit. Desktop only. */
export function ZoneRail({ journeyCount }: { journeyCount: number }) {
  const active = useWorld((s) => sectionForStop(s.activeStop, journeyCount))
  const isProjectOpen = useWorld((s) => s.focusedProject !== null)
  return (
    <nav
      aria-label="Zones"
      className={`fixed top-1/2 right-6 z-20 hidden -translate-y-1/2 transition-opacity duration-500 lg:block ${isProjectOpen ? 'pointer-events-none opacity-0' : ''}`}
    >
      <ol className="flex flex-col gap-4">
        {SECTIONS.map((section, i) => {
          const isActive = section.id === active
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'location' : undefined}
                className="group flex items-center justify-end gap-3"
              >
                <span
                  className={`font-mono text-[10px] tracking-[0.2em] uppercase transition ${
                    isActive ? 'text-white' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')} {section.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-all duration-500 ${
                    isActive ? 'h-6 w-1.5 bg-neon-cyan shadow-[0_0_12px] shadow-neon-cyan' : 'size-1.5 bg-slate-600 group-hover:bg-slate-400'
                  }`}
                />
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
