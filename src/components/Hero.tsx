import type { Profile, Stat } from '../content/types'
import { getViewMode } from '../content/viewMode'
import { useWorld } from '../world/store'

interface HeroProps {
  profile: Profile
  stats: Stat[]
}

function AnimatedName({ name }: { name: string }) {
  let letterIndex = 0
  return (
    <h1
      aria-label={name}
      className="font-display text-[clamp(3.4rem,11vw,9.5rem)] leading-[0.88] font-bold tracking-[-0.04em] text-white"
    >
      {name.split(' ').map((word, w) => (
        <span key={word} aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
          {[...word].map((char) => (
            // Gradient per letter: background-clip:text on the parent doesn't reach transformed children.
            <span key={letterIndex} className={`letter ${w === 1 ? 'text-gradient' : ''}`} style={{ '--i': letterIndex++ } as React.CSSProperties}>
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

export function Hero({ profile, stats }: HeroProps) {
  const isLoaded = useWorld((s) => s.isLoaded)
  const isClassic = getViewMode() === 'classic'

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className={`relative flex min-h-[100svh] items-center px-5 pt-24 pb-16 classic:min-h-0 classic:pt-32 sm:px-10 ${isLoaded ? 'is-intro-done' : ''}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p data-reveal className="eyebrow flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon-lime opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-neon-lime" />
            </span>
            {profile.location} · open to opportunities
          </p>
          <div className="mt-6">
            <AnimatedName name={profile.name} />
          </div>
          <p data-reveal style={{ '--reveal-delay': 500 } as React.CSSProperties} className="mt-6 font-mono text-base text-neon-cyan sm:text-lg">
            {profile.role}
          </p>
          <p
            data-reveal
            style={{ '--reveal-delay': 650 } as React.CSSProperties}
            className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400"
          >
            {profile.tagline}
          </p>
          <div data-reveal style={{ '--reveal-delay': 800 } as React.CSSProperties} className="mt-9 flex flex-wrap gap-3">
            <a href="#about" data-magnetic className="btn bg-white text-ink hover:bg-neon-cyan">
              {isClassic ? 'About me ↓' : 'Explore the world ↓'}
            </a>
            <a href="#contact" data-magnetic className="btn border border-line bg-white/[0.04] text-white backdrop-blur-xl hover:border-neon-violet">
              Get in touch
            </a>
          </div>
          <dl
            data-reveal
            style={{ '--reveal-delay': 950 } as React.CSSProperties}
            className="mt-14 grid max-w-2xl grid-cols-3 gap-4 rounded-2xl bg-ink/50 p-3 backdrop-blur-md sm:gap-8 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1 border-l border-line pl-4">
                <dt className="text-xs leading-snug text-dim">{stat.label}</dt>
                <dd className="font-display text-3xl font-bold text-white sm:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
          {!isClassic && (
            <p data-reveal style={{ '--reveal-delay': 1100 } as React.CSSProperties} className="mt-8 font-mono text-xs text-dim">
              Prefer a lighter page?{' '}
              <a href="./?view=classic" className="text-slate-300 underline underline-offset-4 hover:text-white">
                Classic view
              </a>
            </p>
          )}
        </div>
      </div>
      {!isClassic && (
        <div aria-hidden="true" className="absolute right-10 bottom-8 hidden flex-col items-center gap-3 lg:flex">
          <span className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">scroll to fly</span>
          <span className="scroll-cue h-12 w-px bg-gradient-to-b from-neon-cyan to-transparent" />
        </div>
      )}
    </section>
  )
}
