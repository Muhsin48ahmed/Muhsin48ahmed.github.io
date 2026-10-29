import { cameraStopIds } from '../content/sections'
import { isFromUi, orbLayout, zoneStops } from './helpers'

describe('zoneStops', () => {
  test('matches the camera stop order on the page', () => {
    const ids = cameraStopIds(3)
    const stops = zoneStops(3)
    expect(ids[stops.hero]).toBe('hero')
    expect(ids[stops.about]).toBe('about')
    expect(stops.journey.map((i) => ids[i])).toEqual(['journey-0', 'journey-1', 'journey-2'])
    expect(ids[stops.projects]).toBe('projects')
    expect(ids[stops.contact]).toBe('contact')
  })
})

describe('orbLayout', () => {
  const groups = [
    { name: 'A', skills: ['a1', 'a2'] },
    { name: 'B', skills: ['b1'] },
  ]

  test('makes one orb per skill, tagged with its group', () => {
    const orbs = orbLayout(groups, 1)
    expect(orbs.map((o) => [o.label, o.group])).toEqual([
      ['a1', 0],
      ['a2', 0],
      ['b1', 1],
    ])
  })

  test('gives every orb a radius within range and a start position near the arena', () => {
    orbLayout(groups, 1).forEach((orb) => {
      expect(orb.radius).toBeGreaterThanOrEqual(0.45)
      expect(orb.radius).toBeLessThanOrEqual(0.8)
      expect(Math.hypot(...orb.offset)).toBeLessThanOrEqual(4)
    })
  })

  test('is deterministic for a seed', () => {
    expect(orbLayout(groups, 3)).toEqual(orbLayout(groups, 3))
  })
})

describe('isFromUi', () => {
  test('is true for events that started on a link, button or dialog', () => {
    const button = document.createElement('button')
    const span = document.createElement('span')
    button.appendChild(span)
    expect(isFromUi({ target: span } as unknown as Event)).toBe(true)
  })

  test('is false for events on the canvas or page background', () => {
    expect(isFromUi({ target: document.createElement('canvas') } as unknown as Event)).toBe(false)
    expect(isFromUi({ target: null } as unknown as Event)).toBe(false)
  })
})
