import { sectionProgress, shapeWeights, smoothstep } from './morph'

describe('smoothstep', () => {
  test('clamps below and above the edges', () => {
    expect(smoothstep(0, 1, -1)).toBe(0)
    expect(smoothstep(0, 1, 2)).toBe(1)
  })

  test('is 0.5 at the midpoint', () => {
    expect(smoothstep(0.2, 0.8, 0.5)).toBeCloseTo(0.5)
  })
})

describe('sectionProgress', () => {
  const tops = [0, 1000, 2000, 3000]
  const end = 4000

  test('is 0 when the reading line is at the first section top', () => {
    expect(sectionProgress(tops, end, 0)).toBe(0)
  })

  test('interpolates linearly within a section', () => {
    expect(sectionProgress(tops, end, 1500)).toBeCloseTo(1.5)
  })

  test('uses the document end as the bottom of the last section', () => {
    expect(sectionProgress(tops, end, 3500)).toBeCloseTo(3.5)
  })

  test('clamps above the document end and below the first top', () => {
    expect(sectionProgress(tops, end, 9999)).toBe(4)
    expect(sectionProgress(tops, end, -50)).toBe(0)
  })

  test('returns 0 when there are no sections', () => {
    expect(sectionProgress([], end, 500)).toBe(0)
  })

  test('handles zero-height sections without dividing by zero', () => {
    expect(sectionProgress([0, 0, 1000], 2000, 0)).toBe(1)
  })
})

describe('shapeWeights', () => {
  const sum = (ws: number[]) => ws.reduce((s, w) => s + w, 0)

  test('fully shows the first shape at the start', () => {
    expect(shapeWeights(0.5, 5)).toEqual([1, 0, 0, 0, 0])
  })

  test('fully shows a shape when its section fills the view', () => {
    expect(shapeWeights(2.5, 5)).toEqual([0, 0, 1, 0, 0])
  })

  test('blends two neighbouring shapes evenly at a section boundary', () => {
    const ws = shapeWeights(2, 5)
    expect(ws[1]).toBeCloseTo(0.5)
    expect(ws[2]).toBeCloseTo(0.5)
  })

  test('always sums to 1', () => {
    for (const p of [0, 0.7, 1.3, 2.9, 4.2, 5, 10]) {
      expect(sum(shapeWeights(p, 5))).toBeCloseTo(1)
    }
  })

  test('holds the last shape past the end', () => {
    expect(shapeWeights(10, 5)).toEqual([0, 0, 0, 0, 1])
  })

  test('returns an empty array for zero shapes', () => {
    expect(shapeWeights(1, 0)).toEqual([])
  })
})
