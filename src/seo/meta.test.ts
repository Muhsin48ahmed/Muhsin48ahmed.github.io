import { absoluteUrl, buildHeadTags, type SiteMeta } from './meta'

const site: SiteMeta = {
  title: 'Muhsin Ahmed — Full-Stack Engineer & Data Scientist',
  description: 'An interactive 3D portfolio.',
  url: 'https://example.com',
  image: '/og.jpg',
  imageWidth: 1200,
  imageHeight: 630,
  author: 'Muhsin Ahmed',
}

describe('absoluteUrl', () => {
  test('joins a site url and a path without doubling slashes', () => {
    expect(absoluteUrl('https://example.com/', '/og.jpg')).toBe('https://example.com/og.jpg')
    expect(absoluteUrl('https://example.com', 'og.jpg')).toBe('https://example.com/og.jpg')
  })

  test('falls back to the bare path when the site url is unknown', () => {
    expect(absoluteUrl('', '/og.jpg')).toBe('/og.jpg')
  })
})

describe('buildHeadTags', () => {
  const html = buildHeadTags(site)

  test('emits Open Graph and Twitter card tags with an absolute image', () => {
    expect(html).toContain('<meta property="og:title" content="Muhsin Ahmed — Full-Stack Engineer &amp; Data Scientist">')
    expect(html).toContain('<meta property="og:image" content="https://example.com/og.jpg">')
    expect(html).toContain('<meta property="og:image:width" content="1200">')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(html).toContain('<link rel="canonical" href="https://example.com/">')
  })

  test('escapes quotes and angle brackets in content', () => {
    const tags = buildHeadTags({ ...site, description: 'He said "<hi>"' })
    expect(tags).toContain('content="He said &quot;&lt;hi&gt;&quot;"')
    expect(tags).not.toContain('<hi>')
  })

  test('includes JSON-LD describing the author as a Person', () => {
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"Person"')
    expect(html).toContain('"name":"Muhsin Ahmed"')
  })

  test('omits the canonical link when the site url is unknown', () => {
    expect(buildHeadTags({ ...site, url: '' })).not.toContain('rel="canonical"')
  })
})
