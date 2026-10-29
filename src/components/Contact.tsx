import type { Profile } from '../content/types'
import { Section } from './Section'

export function Contact({ profile }: { profile: Profile }) {
  return (
    <Section id="contact" title="Let’s work together">
      <p className="max-w-lg text-lg leading-relaxed text-slate-400">
        Open to data science, ML engineering and full-stack data roles, and to interesting side projects. Based in{' '}
        {profile.location}.
      </p>

      <a
        href={`mailto:${profile.email}`}
        className="mt-8 inline-block bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-2xl font-semibold text-transparent hover:opacity-80 sm:text-4xl"
      >
        {profile.email}
      </a>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {profile.resumeUrl && (
          <a href={profile.resumeUrl} className="btn bg-neon-cyan text-ink hover:bg-white">
            Download résumé
          </a>
        )}
        <ul className="flex flex-wrap gap-2">
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-line text-white hover:border-neon-violet"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-20 font-mono text-xs text-slate-600">
        © {new Date().getFullYear()} {profile.name} · built with React Three Fiber
      </footer>
    </Section>
  )
}
