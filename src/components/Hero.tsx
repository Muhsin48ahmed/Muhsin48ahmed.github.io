import type { Profile, Stat } from '../content/types'
import { Section } from './Section'

interface HeroProps {
  profile: Profile
  stats: Stat[]
}

export function Hero({ profile, stats }: HeroProps) {
  return (
    <Section id="hero">
      <p className="font-mono text-sm text-neon-cyan">
        <span className="text-slate-500">&gt;&gt;&gt;</span> print(&quot;hello, world&quot;)
      </p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">{profile.name}</h1>
      <p className="mt-3 bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-xl font-medium text-transparent sm:text-2xl">
        {profile.role}
      </p>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">{profile.tagline}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#projects" className="btn bg-neon-cyan text-ink hover:bg-white">
          View projects
        </a>
        <a href="#contact" className="btn border border-line text-white hover:border-neon-violet">
          Get in touch
        </a>
      </div>

      <dl className="mt-14 grid max-w-lg grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1">
            <dt className="text-xs leading-snug text-slate-500">{stat.label}</dt>
            <dd className="text-2xl font-semibold text-white sm:text-3xl">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
