/** Page sections in scroll order; the 3D camera flies to one zone per section. */
export const SECTIONS = [
  { id: 'hero', label: 'Home', caption: 'zone 01 — neural core' },
  { id: 'about', label: 'About', caption: 'zone 02 — skill field · drag the orbs' },
  { id: 'journey', label: 'Journey', caption: 'zone 03 — data city · career timeline' },
  { id: 'projects', label: 'Projects', caption: 'zone 04 — holo deck · click a screen' },
  { id: 'contact', label: 'Contact', caption: 'zone 05 — the portal' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export const journeyStopId = (index: number) => `journey-${index}`

/**
 * DOM ids the camera stops at, in order. The journey section has one stop per milestone,
 * so this must stay in sync with `cameraKeyframes` in world/layout.ts.
 */
export function cameraStopIds(journeyCount: number): string[] {
  return [
    'hero',
    'about',
    ...Array.from({ length: journeyCount }, (_, i) => journeyStopId(i)),
    'projects',
    'contact',
  ]
}

/** Page section that a camera stop (index into `cameraStopIds`) belongs to. */
export function sectionForStop(stop: number, journeyCount: number): SectionId {
  const ids = cameraStopIds(journeyCount)
  const id = ids[Math.min(Math.max(stop, 0), ids.length - 1)]!
  return id.startsWith('journey') ? 'journey' : (id as SectionId)
}

export function captionFor(id: SectionId): string {
  return SECTIONS.find((s) => s.id === id)!.caption
}
