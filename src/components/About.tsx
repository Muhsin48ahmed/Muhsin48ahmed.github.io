import type { Profile, SkillGroup } from '../content/types'
import { Section } from './Section'

const GROUP_ACCENTS = ['bg-neon-cyan', 'bg-neon-violet', 'bg-neon-pink', 'bg-neon-lime']

interface AboutProps {
  profile: Profile
  skillGroups: SkillGroup[]
}

export function About({ profile, skillGroups }: AboutProps) {
  return (
    <Section id="about" title="About me">
      <div className="space-y-4 text-lg leading-relaxed text-slate-400">
        {profile.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {skillGroups.map((group, i) => (
          <div key={group.name} className="panel p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden="true" className={`size-2 rounded-full ${GROUP_ACCENTS[i % GROUP_ACCENTS.length]}`} />
              {group.name}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li key={skill} className="chip">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
