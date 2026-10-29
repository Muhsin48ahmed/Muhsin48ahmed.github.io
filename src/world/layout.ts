import type { Pose } from './cameraPath'
import type { Vec3 } from './network'

/** World-space anchors for each zone. The camera flies forward along −z. */
export const HERO_CORE: Vec3 = [0, 0, 0]
export const ORB_ARENA: Vec3 = [0, 0, -40]
export const CITY_CENTER: Vec3 = [0, -5, -86]
export const PROJECT_VIEWPOINT: Vec3 = [0, 2, -118]
export const PORTAL: Vec3 = [0, 2, -168]

const CITY_PATH_START: Vec3 = [-9, -5, -74]
const CITY_PATH_END: Vec3 = [9, -5, -98]
const MIN_TOWER = 3
const MAX_TOWER = 8
const SCREEN_RADIUS = 11
const SCREEN_SPREAD = 0.62 // radians either side of centre
const FOCUS_DISTANCE = 6

export interface ScreenPlacement {
  position: Vec3
  rotationY: number
  normal: Vec3
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Ground positions of the career milestones, oldest first. */
export function milestoneSites(count: number): Vec3[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1)
    return [0, 1, 2].map((axis) => lerp(CITY_PATH_START[axis]!, CITY_PATH_END[axis]!, t)) as unknown as Vec3
  })
}

/** Later milestones stand taller — the skyline grows with the career. */
export function milestoneHeight(index: number, count: number): number {
  return count === 1 ? MAX_TOWER : lerp(MIN_TOWER, MAX_TOWER, index / (count - 1))
}

/** Project screens on an arc around the viewpoint, each turned to face it. */
export function screenPlacements(count: number): ScreenPlacement[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = count === 1 ? 0 : lerp(-SCREEN_SPREAD, SCREEN_SPREAD, i / (count - 1))
    const [vx, vy, vz] = PROJECT_VIEWPOINT
    return {
      position: [vx + SCREEN_RADIUS * Math.sin(angle), vy, vz - SCREEN_RADIUS * Math.cos(angle)],
      rotationY: -angle,
      normal: [-Math.sin(angle), 0, Math.cos(angle)],
    }
  })
}

export function projectFocusPose({ position, normal }: ScreenPlacement): Pose {
  return {
    eye: [0, 1, 2].map((axis) => position[axis]! + normal[axis]! * FOCUS_DISTANCE) as unknown as Vec3,
    focus: position,
    framing: 1,
  }
}

const offset = (base: Vec3, dx: number, dy: number, dz: number): Vec3 => [base[0] + dx, base[1] + dy, base[2] + dz]

/** One camera pose per stop from `cameraStopIds`, in the same order. */
export function cameraKeyframes(journeyCount: number): Pose[] {
  const journey = milestoneSites(journeyCount).map((site, i): Pose => {
    const top = offset(site, 0, milestoneHeight(i, journeyCount) * 0.7, 0)
    return { eye: offset(top, 1.5, 3.5, 11), focus: top }
  })
  return [
    { eye: offset(HERO_CORE, 0, 0.6, 12), focus: HERO_CORE },
    { eye: offset(ORB_ARENA, 0, 1.2, 12), focus: ORB_ARENA },
    ...journey,
    {
      eye: offset(PROJECT_VIEWPOINT, 0, 0.8, 5),
      focus: offset(PROJECT_VIEWPOINT, 0, 0, -SCREEN_RADIUS),
      framing: 0,
    },
    { eye: offset(PORTAL, 0, 0.4, 12), focus: PORTAL },
  ]
}
