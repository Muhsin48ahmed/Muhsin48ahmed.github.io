import { magneticOffset } from './magnetic'

const rect = { left: 100, top: 100, width: 200, height: 50 }

describe('magneticOffset', () => {
  test('is zero when the pointer sits on the centre', () => {
    expect(magneticOffset({ x: 200, y: 125 }, rect)).toEqual({ x: 0, y: 0 })
  })

  test('leans toward the pointer by a fraction of the distance', () => {
    const { x, y } = magneticOffset({ x: 240, y: 125 }, rect, { strength: 0.25 })
    expect(x).toBeCloseTo(10)
    expect(y).toBe(0)
  })

  test('snaps back to zero once the pointer is outside the pull radius', () => {
    expect(magneticOffset({ x: 900, y: 900 }, rect)).toEqual({ x: 0, y: 0 })
  })
})
