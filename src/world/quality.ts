import { create } from 'zustand'

export type QualityTier = 'low' | 'medium' | 'high'

export interface DeviceHints {
  hardwareConcurrency: number | undefined
  deviceMemory: number | undefined
  isMobile: boolean
  saveData: boolean
  prefersReducedMotion: boolean
}

export interface QualitySettings {
  maxDpr: number
  effects: boolean
  physics: boolean
  dustCount: number
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  high: { maxDpr: 2, effects: true, physics: true, dustCount: 2600 },
  medium: { maxDpr: 1.5, effects: true, physics: true, dustCount: 1600 },
  low: { maxDpr: 1, effects: false, physics: false, dustCount: 800 },
}

const TIERS: QualityTier[] = ['low', 'medium', 'high']
const WEAK_CORES = 4
const WEAK_MEMORY_GB = 4

/** Starting tier from what the browser tells us; the performance monitor adjusts from there. */
export function initialTier(device: DeviceHints): QualityTier {
  if (device.saveData) return 'low'
  const cores = device.hardwareConcurrency
  const memory = device.deviceMemory
  if ((cores !== undefined && cores < WEAK_CORES) || (memory !== undefined && memory < WEAK_MEMORY_GB)) return 'low'
  if (device.isMobile || device.prefersReducedMotion) return 'medium'
  if (cores === undefined || memory === undefined) return 'medium'
  return 'high'
}

export function stepTier(tier: QualityTier, delta: 1 | -1): QualityTier {
  const index = Math.min(Math.max(TIERS.indexOf(tier) + delta, 0), TIERS.length - 1)
  return TIERS[index]!
}

interface QualityState {
  tier: QualityTier
  /** The tier the device started on; the monitor never raises quality above it. */
  ceiling: QualityTier
  settings: QualitySettings
  start: (tier: QualityTier) => void
  decline: () => void
  incline: () => void
}

export const useQuality = create<QualityState>()((set) => ({
  tier: 'medium',
  ceiling: 'medium',
  settings: QUALITY.medium,
  start: (tier) => set({ tier, ceiling: tier, settings: QUALITY[tier] }),
  decline: () =>
    set((s) => {
      const tier = stepTier(s.tier, -1)
      return { tier, settings: QUALITY[tier] }
    }),
  incline: () =>
    set((s) => {
      const tier = stepTier(s.tier, 1)
      if (TIERS.indexOf(tier) > TIERS.indexOf(s.ceiling)) return s
      return { tier, settings: QUALITY[tier] }
    }),
}))

export function readDeviceHints(): DeviceHints {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  return {
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    isMobile: window.matchMedia?.('(max-width: 767px), (pointer: coarse)').matches ?? false,
    saveData: nav.connection?.saveData ?? false,
    prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  }
}
