/** Head tags for link previews (Open Graph, Twitter) and search engines. Pure, so vite.config can use it at build time. */

export interface SiteMeta {
  title: string
  description: string
  /** Absolute origin, e.g. https://example.com. Empty when unknown (previews then get a relative image path). */
  url: string
  image: string
  imageWidth: number
  imageHeight: number
  author: string
}

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function absoluteUrl(siteUrl: string, path: string): string {
  if (!siteUrl) return path.startsWith('/') ? path : `/${path}`
  return `${siteUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

const meta = (attr: 'name' | 'property', key: string, content: string) =>
  `<meta ${attr}="${key}" content="${escapeAttr(content)}">`

export function buildHeadTags(site: SiteMeta): string {
  const image = absoluteUrl(site.url, site.image)
  const canonical = site.url ? `${site.url.replace(/\/+$/, '')}/` : ''
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.author,
    jobTitle: site.title.split('—')[1]?.trim() ?? '',
    ...(canonical ? { url: canonical } : {}),
  }
  const tags = [
    meta('property', 'og:type', 'website'),
    meta('property', 'og:title', site.title),
    meta('property', 'og:description', site.description),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', String(site.imageWidth)),
    meta('property', 'og:image:height', String(site.imageHeight)),
    meta('property', 'og:image:alt', `${site.author} portfolio preview`),
    ...(canonical ? [meta('property', 'og:url', canonical), `<link rel="canonical" href="${canonical}">`] : []),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', site.title),
    meta('name', 'twitter:description', site.description),
    meta('name', 'twitter:image', image),
    meta('name', 'author', site.author),
    `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`,
  ]
  return tags.join('\n    ')
}
