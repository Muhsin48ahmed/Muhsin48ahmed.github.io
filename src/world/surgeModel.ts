/**
 * A transparent surge-likelihood estimator built from the capstone's PUBLISHED summary statistics
 * (nairobi-surge-analysis/outputs, 3.7M trips, Jan–Jul 2024). It is not the trained XGBoost model;
 * it multiplies the baseline rate by lifts observed in the data so visitors can explore the findings.
 */

export type HourBand = 'morning' | 'evening' | 'offPeak'
export type SurgeZone = 'cbd' | 'inner' | 'outer'

export interface SurgeInputs {
  hour: number
  isRaining: boolean
  zone: SurgeZone
}

export interface SurgeDriver {
  label: string
  lift: number
}

/** Surge-event rates from peak_flag_surge_summary.csv: evening peak 27.61%, morning 17.66%, the rest derived. */
export const BASE_RATES: Record<HourBand, number> = { evening: 0.2761, morning: 0.1766, offPeak: 0.1494 }
/** rain_flag table in the EDA notebook: 21.95% with rain vs 18.05% dry. */
export const RAIN_LIFT = 0.2195 / 0.1805
/** K-means pickup clusters: the CBD cluster's mean multiplier is ~2× the city-wide mean; outer clusters ~½. */
export const SURGE_ZONES: Record<SurgeZone, { label: string; lift: number }> = {
  cbd: { label: 'CBD core', lift: 1.9 },
  inner: { label: 'Inner suburbs', lift: 1 },
  outer: { label: 'Outer areas', lift: 0.5 },
}

const MORNING = { from: 7, to: 9 }
const EVENING = { from: 17, to: 21 }
const MIN_P = 0.02
const MAX_P = 0.95

export function hourBand(hour: number): HourBand {
  if (hour >= EVENING.from && hour <= EVENING.to) return 'evening'
  if (hour >= MORNING.from && hour <= MORNING.to) return 'morning'
  return 'offPeak'
}

const BAND_LABEL: Record<HourBand, string> = { evening: 'Evening peak', morning: 'Morning peak', offPeak: 'Off-peak' }

export function estimateSurge({ hour, isRaining, zone }: SurgeInputs): { probability: number; drivers: SurgeDriver[] } {
  const band = hourBand(hour)
  const drivers: SurgeDriver[] = [
    { label: BAND_LABEL[band], lift: BASE_RATES[band] / BASE_RATES.offPeak },
    { label: isRaining ? 'Rain' : 'Dry', lift: isRaining ? RAIN_LIFT : 1 },
    { label: SURGE_ZONES[zone].label, lift: SURGE_ZONES[zone].lift },
  ]
  const raw = drivers.reduce((p, d) => p * d.lift, BASE_RATES.offPeak)
  return { probability: Math.min(Math.max(raw, MIN_P), MAX_P), drivers }
}
