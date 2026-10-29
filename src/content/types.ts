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

export interface Experience {
  role: string
  company: string
  period: string
  highlights: string[]
  stack: string[]
}

export interface Project {
  title: string
  summary: string
  impact: string
  stack: string[]
  repoUrl?: string
  demoUrl?: string
}

export interface Portfolio {
  profile: Profile
  stats: Stat[]
  skillGroups: SkillGroup[]
  experience: Experience[]
  projects: Project[]
}
