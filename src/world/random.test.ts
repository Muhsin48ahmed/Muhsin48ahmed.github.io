import { createRng, gaussian } from './random'

describe('createRng', () => {
  test('produces the same sequence for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    const seqA = Array.from({ length: 5 }, a)
    const seqB = Array.from({ length: 5 }, b)
    expect(seqA).toEqual(seqB)
  })

  test('produces different sequences for different seeds', () => {
    const a = createRng(1)
    const b = createRng(2)
    expect(a()).not.toBe(b())
  })

  test('returns values in [0, 1)', () => {
    const rng = createRng(7)
    const values = Array.from({ length: 1000 }, rng)
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true)
  })
})

describe('gaussian', () => {
  test('has roughly zero mean and unit variance', () => {
    const rng = createRng(123)
    const samples = Array.from({ length: 5000 }, () => gaussian(rng))
    const mean = samples.reduce((s, v) => s + v, 0) / samples.length
    const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / samples.length
    expect(Math.abs(mean)).toBeLessThan(0.05)
    expect(Math.abs(variance - 1)).toBeLessThan(0.1)
  })
})
