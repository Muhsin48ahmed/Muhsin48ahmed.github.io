import type { SkillGroup } from '../content/types'
import type { Vec3 } from './network'
import { createRng } from './random'

/** Index of each zone's stop(s) in `cameraStopIds`. */
export function zoneStops(journeyCount: number) {
  const journey = Array.from({ length: journeyCount }, (_, i) => 2 + i)
  return { hero: 0, about: 1, journey, projects: 2 + journeyCount, contact: 3 + journeyCount }
}

export interface OrbSpec {
  label: string
  group: number
  radius: number
  /** Start position relative to the arena centre. */
  offset: Vec3
}

const MIN_RADIUS = 0.45
const MAX_RADIUS = 0.8
const SPAWN_RADIUS = 3.5

export function orbLayout(groups: readonly SkillGroup[], seed: number): OrbSpec[] {
  const rng = createRng(seed)
  return groups.flatMap((group, groupIndex) =>
    group.skills.map((label): OrbSpec => {
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(rng() * 2 - 1)
      const r = Math.cbrt(rng()) * SPAWN_RADIUS
      return {
        label,
        group: groupIndex,
        radius: MIN_RADIUS + rng() * (MAX_RADIUS - MIN_RADIUS),
        offset: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi) * 0.5],
      }
    }),
  )
}

const UI_SELECTOR = 'a, button, input, textarea, [role="dialog"], nav'

/** The canvas listens on <body>, so ignore pointer events that began on HTML controls above it. */
export function isFromUi(event: Pick<Event, 'target'>): boolean {
  const target = event.target as Element | null
  return Boolean(target?.closest?.(UI_SELECTOR))
}
