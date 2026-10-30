import type { Award, Profile, SkillGroup } from '../content/types'
import { SectionHeader } from './SectionHeader'

const GROUP_ACCENTS = ['bg-neon-cyan', 'bg-neon-violet', 'bg-neon-pink', 'bg-neon-lime']

interface AboutProps {
  profile: Profile
  skillGroups: SkillGroup[]
  awards: Award[]
}

export function About({ profile, skillGroups, awards }: AboutProps) {
  return (
    <section id="about" aria-labelledby="about-title" className="relative flex min-h-[100svh] items-center px-5 py-28 classic:min-h-0 classic:py-20 sm:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-xl">
          <SectionHeader id="about" title="About me" />
          <div data-reveal className="space-y-4 text-lg leading-relaxed text-slate-400">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div data-reveal className="panel mt-8 divide-y divide-line">
            {skillGroups.map((group, i) => (
              <div key={group.name} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <h3 className="flex w-36 shrink-0 items-center gap-2 text-sm font-medium text-white">
                  <span aria-hidden="true" className={`size-2 rounded-full ${GROUP_ACCENTS[i % GROUP_ACCENTS.length]}`} />
                  {group.name}
                </h3>
                <ul className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <li key={skill} className="chip">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <ul data-reveal className="mt-6 space-y-3">
            {awards.map((award) => (
              <li key={award.title} className="flex gap-4 text-sm">
                <span className="w-16 shrink-0 font-mono text-xs leading-5 text-dim">{award.date}</span>
                <span>
                  <span className="block text-white">{award.title}</span>
                  <span className="text-dim">{award.issuer}</span>
                </span>
              </li>
            ))}
          </ul>
          <p data-reveal className="mt-6 font-mono text-xs text-dim">
            Speaks <span className="text-slate-300">{profile.languages.join(' · ')}</span>
          </p>
          <p data-reveal className="chip mt-8 hidden w-fit classic:hidden lg:block">
            ✦ grab the orbs on the right and throw them around
          </p>
        </div>
      </div>
    </section>
  )
}
