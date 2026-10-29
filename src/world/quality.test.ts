import { QUALITY, initialTier, stepTier, useQuality, type DeviceHints } from './quality'

const desktop: DeviceHints = { hardwareConcurrency: 8, deviceMemory: 16, isMobile: false, saveData: false, prefersReducedMotion: false }

describe('initialTier', () => {
  test('starts high on a capable desktop', () => {
    expect(initialTier(desktop)).toBe('high')
  })

  test('starts medium on a phone', () => {
    expect(initialTier({ ...desktop, isMobile: true })).toBe('medium')
  })

  test('starts low on a weak device or with data saver', () => {
    expect(initialTier({ ...desktop, hardwareConcurrency: 2, deviceMemory: 2 })).toBe('low')
    expect(initialTier({ ...desktop, saveData: true })).toBe('low')
  })

  test('treats unknown hardware as medium', () => {
    expect(initialTier({ ...desktop, hardwareConcurrency: undefined, deviceMemory: undefined })).toBe('medium')
  })

  test('never goes above medium with reduced motion', () => {
    expect(initialTier({ ...desktop, prefersReducedMotion: true })).toBe('medium')
  })
})

describe('stepTier', () => {
  test('steps down and up within bounds', () => {
    expect(stepTier('high', -1)).toBe('medium')
    expect(stepTier('medium', -1)).toBe('low')
    expect(stepTier('low', -1)).toBe('low')
    expect(stepTier('low', 1)).toBe('medium')
    expect(stepTier('high', 1)).toBe('high')
  })
})

describe('QUALITY settings', () => {
  test('low tier disables effects and physics and caps pixel ratio', () => {
    expect(QUALITY.low.effects).toBe(false)
    expect(QUALITY.low.physics).toBe(false)
    expect(QUALITY.low.maxDpr).toBeLessThanOrEqual(1)
    expect(QUALITY.high.effects).toBe(true)
  })
})

describe('useQuality store', () => {
  const initial = useQuality.getState()
  afterEach(() => useQuality.setState(initial, true))

  test('decline lowers the tier and incline raises it, but never above the starting tier', () => {
    useQuality.getState().start('medium')
    useQuality.getState().decline()
    expect(useQuality.getState().tier).toBe('low')
    useQuality.getState().incline()
    expect(useQuality.getState().tier).toBe('medium')
    useQuality.getState().incline()
    expect(useQuality.getState().tier).toBe('medium')
  })
})
