import type { SiteMeta } from '../seo/meta'

/** Site-level metadata. The origin comes from VITE_SITE_URL at build time (see .env.example). */
export const siteMeta = (siteUrl: string): SiteMeta => ({
  title: 'Muhsin Ahmed — Full-Stack Engineer & Data Scientist',
  description:
    'Full-stack engineer and data scientist in Nairobi. Explore an interactive 3D world: a neural core, a city of career milestones, holographic projects and a live surge-pricing explorer.',
  url: siteUrl,
  image: '/og.jpg',
  imageWidth: 1200,
  imageHeight: 630,
  author: 'Muhsin Ahmed',
})
