export interface SocialLink {
  label: string
  href: string
}

export interface Profile {
  name: string
  role: string
  tagline: string
  location: string
  email: string
  resumeUrl?: string
  bio: string[]
  languages: string[]
  socials: SocialLink[]
}

export interface Stat {
  value: string
  label: string
}

export interface SkillGroup {
  name: string
  skills: string[]
}

export interface Milestone {
  period: string
  title: string
  org: string
  kind: 'work' | 'education'
  highlights: string[]
  stack: string[]
}

export interface Chart {
  src: string
  alt: string
}

export interface Project {
  title: string
  category: string
  summary: string
  impact: string
  highlights: string[]
  stack: string[]
  repoUrl?: string
  demoUrl?: string
  /** Figures from the project's repo; the first one shows on its holo screen. */
  charts?: Chart[]
  /** Interactive demo rendered inside the project's detail panel. */
  lab?: 'surge'
}

export interface Award {
  date: string
  title: string
  issuer: string
}

export interface Portfolio {
  profile: Profile
  stats: Stat[]
  skillGroups: SkillGroup[]
  /** Oldest first — the camera flies through it in time order. */
  journey: Milestone[]
  projects: Project[]
  awards: Award[]
}
