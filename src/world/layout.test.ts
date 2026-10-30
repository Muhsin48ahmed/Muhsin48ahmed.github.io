import { SECTIONS, cameraStopIds } from '../content/sections'
import {
  PROJECT_VIEWPOINT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  cameraKeyframes,
  milestoneHeight,
  milestoneSites,
  projectFocusPose,
  screenPlacements,
} from './layout'

const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(...a.map((v, i) => v - b[i]!))

describe('milestoneSites', () => {
  test('places one site per milestone, moving forward (−z) through the city', () => {
    const sites = milestoneSites(4)
    expect(sites).toHaveLength(4)
    sites.slice(1).forEach((site, i) => expect(site[2]).toBeLessThan(sites[i]![2]))
  })

  test('handles a single milestone', () => {
    expect(milestoneSites(1)).toHaveLength(1)
  })
})

describe('milestoneHeight', () => {
  test('grows with each later milestone', () => {
    expect(milestoneHeight(3, 4)).toBeGreaterThan(milestoneHeight(0, 4))
  })
})

describe('screenPlacements', () => {
  test('keeps every screen the same distance from the viewpoint', () => {
    const screens = screenPlacements(4)
    const radii = screens.map((s) => distance(s.position, PROJECT_VIEWPOINT))
    radii.forEach((r) => expect(r).toBeCloseTo(radii[0]!))
  })

  test('turns each screen to face the viewpoint', () => {
    screenPlacements(5).forEach(({ position, normal }) => {
      const toViewer = PROJECT_VIEWPOINT.map((v, i) => v - position[i]!)
      const len = Math.hypot(...toViewer)
      const dot = toViewer.reduce((s, v, i) => s + (v / len) * normal[i]!, 0)
      expect(dot).toBeCloseTo(1)
    })
  })

  test.each([3, 4, 5, 6])('leaves a gap between neighbouring screens (%i screens)', (count) => {
    const screens = screenPlacements(count)
    screens.slice(1).forEach((screen, i) => {
      expect(distance(screen.position, screens[i]!.position)).toBeGreaterThan(SCREEN_WIDTH)
    })
  })

  test('keeps up to five screens on one row', () => {
    expect(new Set(screenPlacements(5).map((s) => s.position[1])).size).toBe(1)
  })

  test('splits more than five screens into two rows that do not overlap', () => {
    const screens = screenPlacements(8)
    const rows = [...new Set(screens.map((s) => s.position[1]))].sort((a, b) => b - a)
    expect(rows).toHaveLength(2)
    expect(rows[0]! - rows[1]!).toBeGreaterThan(SCREEN_HEIGHT)
    expect(screens.filter((s) => s.position[1] === rows[0])).toHaveLength(4)
  })

  test('lifts a two-row formation above the viewpoint to leave room for the project picker', () => {
    const ys = screenPlacements(8).map((s) => s.position[1])
    const centre = (Math.max(...ys) + Math.min(...ys)) / 2
    expect(centre).toBeGreaterThan(PROJECT_VIEWPOINT[1])
  })

  test.each([3, 5, 8])('keeps every screen inside the overview camera frame (%i screens)', (count) => {
    const overview = cameraKeyframes(1)[cameraStopIds(1).indexOf('projects')]!
    const halfFovRad = (45 / 2) * (Math.PI / 180) * 1.55 // horizontal half-FOV at a 16:10 aspect, with margin
    screenPlacements(count).forEach(({ position }) => {
      const dx = position[0] - overview.eye[0]
      const dz = overview.eye[2] - position[2]
      expect(Math.atan2(Math.abs(dx) + SCREEN_WIDTH / 2, dz)).toBeLessThan(halfFovRad)
    })
  })

  test('centres a single screen', () => {
    expect(screenPlacements(1)[0]!.position[0]).toBeCloseTo(0)
  })
})

describe('projectFocusPose', () => {
  test('puts the camera in front of the screen looking straight at it', () => {
    const screen = screenPlacements(3)[2]!
    const pose = projectFocusPose(screen)
    expect(pose.focus).toEqual(screen.position)
    expect(distance(pose.eye, screen.position)).toBeGreaterThan(2)
  })
})

describe('cameraKeyframes', () => {
  test('has exactly one pose per camera stop on the page', () => {
    expect(cameraKeyframes(4)).toHaveLength(cameraStopIds(4).length)
  })

  test('flies forward (−z) from stop to stop', () => {
    const poses = cameraKeyframes(4)
    poses.slice(1).forEach((pose, i) => expect(pose.focus[2]).toBeLessThan(poses[i]!.focus[2]))
  })

  test('centres the projects stop so the screens fill the view', () => {
    const poses = cameraKeyframes(2)
    expect(poses[cameraStopIds(2).indexOf('projects')]!.framing).toBe(0)
  })

  test('covers every page section', () => {
    expect(cameraStopIds(2)).toEqual(['hero', 'about', 'journey-0', 'journey-1', 'projects', 'contact'])
    expect(SECTIONS.map((s) => s.id)).toEqual(['hero', 'about', 'journey', 'projects', 'contact'])
  })
})
