import { useWorld } from './store'

const NEIGHBOURHOOD = 1.5

/** True while the camera is at, or one stop away from, any of the zone's stops — off-screen zones skip rendering. */
export function useZoneActive(stops: readonly number[]): boolean {
  return useWorld((s) => stops.some((stop) => Math.abs(s.activeStop - stop) <= NEIGHBOURHOOD))
}
