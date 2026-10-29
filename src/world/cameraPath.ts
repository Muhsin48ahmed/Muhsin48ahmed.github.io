import { shapeWeights } from './morph'
import type { Vec3 } from './network'

export interface Pose {
  eye: Vec3
  focus: Vec3
  /** 1 = aim beside the subject to clear the text column (default), 0 = centre it. */
  framing?: number
}

const WIDE_ASPECT = 1.1
/** How far (as a fraction of camera distance) to aim beside the subject so it clears the text column. */
const WIDE_SHIFT_X = -0.3
const TALL_SHIFT_Y = 0.32
/** Narrow screens have a narrow horizontal field of view, so back the camera off. */
const TALL_ZOOM = 1.6

const blend = (vectors: readonly Vec3[], weights: readonly number[]): Vec3 =>
  [0, 1, 2].map((axis) => vectors.reduce((sum, v, k) => sum + v[axis]! * weights[k]!, 0)) as unknown as Vec3

/**
 * Camera pose for a scroll progress from `sectionProgress`: holds each keyframe while its
 * stop fills the screen and glides to the next one around the boundary.
 */
export function poseAt(keyframes: readonly Pose[], progress: number): Required<Pose> {
  if (keyframes.length === 0) throw new Error('poseAt needs at least one keyframe')
  const weights = shapeWeights(progress, keyframes.length)
  return {
    eye: blend(keyframes.map((k) => k.eye), weights),
    focus: blend(keyframes.map((k) => k.focus), weights),
    framing: keyframes.reduce((sum, k, i) => sum + (k.framing ?? 1) * weights[i]!, 0),
  }
}

/**
 * Where to aim relative to the subject (camera right/up units per unit of distance),
 * and how much to scale the camera's distance from it.
 */
export function framingShift(aspect: number): { x: number; y: number; zoom: number } {
  return aspect >= WIDE_ASPECT ? { x: WIDE_SHIFT_X, y: 0, zoom: 1 } : { x: 0, y: TALL_SHIFT_Y, zoom: TALL_ZOOM }
}
