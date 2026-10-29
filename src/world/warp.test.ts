import { warpAmount } from './warp'

describe('warpAmount', () => {
  test('is 0 when the camera is still or crawling', () => {
    expect(warpAmount(0)).toBe(0)
    expect(warpAmount(2)).toBe(0)
  })

  test('ramps up smoothly with speed and saturates at 1', () => {
    const mid = warpAmount(14)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1)
    expect(warpAmount(40)).toBe(1)
    expect(warpAmount(400)).toBe(1)
  })
})
