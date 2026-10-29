import { smoothstep } from './morph'

/** Camera speed (world units/s) below which there is no warp, and above which it is fully on. */
const WARP_START_SPEED = 4
const WARP_FULL_SPEED = 30

/** Shared per-frame camera motion, written by CameraRig and read by the warp effects. Not React state on purpose. */
export const motion = { speed: 0, warp: 0 }

export function warpAmount(speed: number): number {
  return smoothstep(WARP_START_SPEED, WARP_FULL_SPEED, speed)
}
