import type { Profile } from '../content/types'
import { SectionHeader } from './SectionHeader'

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative flex min-h-[100svh] flex-col justify-center px-5 pt-28 pb-10 sm:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <SectionHeader id="contact" title="Let’s build something." />
          <p data-reveal className="max-w-lg text-lg leading-relaxed text-slate-400">
            Open to full-stack, data science and ML engineering roles — and to ambitious projects. Step through the
            portal, or just send an email.
          </p>
          <a
            data-reveal
            href={`mailto:${profile.email}`}
            className="text-gradient mt-10 inline-block font-display text-[clamp(1.35rem,3.6vw,2.9rem)] font-bold [overflow-wrap:anywhere] hover:opacity-80"
          >
            {profile.email}
          </a>
          <div data-reveal className="mt-10 flex flex-wrap items-center gap-3">
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="btn bg-white text-ink hover:bg-neon-cyan">
                Download résumé
              </a>
            )}
            {profile.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-line bg-white/[0.04] text-white backdrop-blur-xl hover:border-neon-violet"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <footer className="mx-auto mt-24 flex w-full max-w-7xl justify-between font-mono text-[11px] text-slate-600">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{profile.location}</span>
      </footer>
    </section>
  )
}
