import { BASE_RATES, SURGE_ZONES, estimateSurge, hourBand } from './surgeModel'

describe('hourBand', () => {
  test('classifies the published peak windows', () => {
    expect(hourBand(18)).toBe('evening')
    expect(hourBand(21)).toBe('evening')
    expect(hourBand(8)).toBe('morning')
    expect(hourBand(13)).toBe('offPeak')
    expect(hourBand(2)).toBe('offPeak')
  })
})

describe('estimateSurge', () => {
  const dryCbdOffPeak = { hour: 13, isRaining: false, zone: 'inner' as const }

  test('reproduces the published off-peak dry rate as its baseline', () => {
    const { probability, drivers } = estimateSurge(dryCbdOffPeak)
    expect(probability).toBeCloseTo(BASE_RATES.offPeak, 3)
    expect(drivers.every((d) => d.lift === 1)).toBe(true)
  })

  test('evening peak and rain each raise the estimate', () => {
    const evening = estimateSurge({ ...dryCbdOffPeak, hour: 19 }).probability
    const rain = estimateSurge({ ...dryCbdOffPeak, isRaining: true }).probability
    expect(evening).toBeGreaterThan(BASE_RATES.offPeak)
    expect(rain).toBeGreaterThan(BASE_RATES.offPeak)
    expect(estimateSurge({ hour: 19, isRaining: true, zone: 'cbd' }).probability).toBeGreaterThan(evening)
  })

  test('zones scale the estimate and outer areas are quieter', () => {
    expect(SURGE_ZONES.cbd.lift).toBeGreaterThan(SURGE_ZONES.outer.lift)
    expect(estimateSurge({ ...dryCbdOffPeak, zone: 'outer' }).probability).toBeLessThan(BASE_RATES.offPeak)
  })

  test('never leaves the open interval (0, 1)', () => {
    const p = estimateSurge({ hour: 19, isRaining: true, zone: 'cbd' }).probability
    expect(p).toBeGreaterThan(0)
    expect(p).toBeLessThan(1)
  })

  test('lists a driver per input with a label and lift', () => {
    const { drivers } = estimateSurge({ hour: 19, isRaining: true, zone: 'cbd' })
    expect(drivers.map((d) => d.label)).toEqual(['Evening peak', 'Rain', 'CBD core'])
    drivers.forEach((d) => expect(d.lift).toBeGreaterThan(1))
  })
})
