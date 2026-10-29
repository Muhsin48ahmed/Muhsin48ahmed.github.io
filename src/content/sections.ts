/**
 * Page sections in scroll order. Each one has a matching 3D shape (see scene/shapes.ts),
 * so the order here and in `SHAPE_BUILDERS` must stay aligned.
 */
export const SECTIONS = [
  { id: 'hero', label: 'Home', figure: 'fig. 1 — feed-forward network' },
  { id: 'about', label: 'About', figure: 'fig. 2 — skill embedding clusters' },
  { id: 'experience', label: 'Experience', figure: 'fig. 3 — career as a time series' },
  { id: 'projects', label: 'Projects', figure: 'fig. 4 — loss landscape' },
  { id: 'contact', label: 'Contact', figure: 'fig. 5 — global minimum: you' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export const SECTION_IDS: readonly SectionId[] = SECTIONS.map((s) => s.id)

export function figureFor(id: SectionId): string {
  return SECTIONS.find((s) => s.id === id)!.figure
}
