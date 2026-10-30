import type { Profile } from '../content/types'
import { getViewMode } from '../content/viewMode'
import { ContactForm } from './ContactForm'
import { SectionHeader } from './SectionHeader'

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID ?? ''

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative flex min-h-[100svh] flex-col justify-center px-5 pt-28 pb-10 classic:min-h-0 classic:pt-20 sm:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <SectionHeader id="contact" title="Let’s build something." />
          <p data-reveal className="max-w-lg text-lg leading-relaxed text-slate-400">
            Open to full-stack, data science and ML engineering roles — and to ambitious projects.{' '}
            {getViewMode() === 'classic' ? 'Send a message below, or email me directly.' : 'Step through the portal, or just send an email.'}
          </p>
          <a
            data-reveal
            href={`mailto:${profile.email}`}
            className="text-gradient mt-8 inline-block font-display text-[clamp(1.35rem,3.6vw,2.9rem)] font-bold [overflow-wrap:anywhere] hover:opacity-80"
          >
            {profile.email}
          </a>
          <div data-reveal className="mt-8">
            <ContactForm to={profile.email} formId={FORMSPREE_ID} />
          </div>
          <div data-reveal className="mt-6 flex flex-wrap items-center gap-3">
            {profile.resumeUrl && (
              <a
                data-magnetic
                href={profile.resumeUrl}
                download={`${profile.name.replace(/\s+/g, '-')}-CV.pdf`}
                className="btn bg-white text-ink hover:bg-neon-cyan"
              >
                Download résumé
              </a>
            )}
            {profile.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="btn border border-line bg-white/[0.04] text-white backdrop-blur-xl hover:border-neon-violet"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <footer className="mx-auto mt-24 flex w-full max-w-7xl justify-between font-mono text-[11px] text-dim">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{profile.location}</span>
      </footer>
    </section>
  )
}
