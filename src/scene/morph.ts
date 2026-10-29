const TRANSITION_START = 0.2
const TRANSITION_END = 0.8

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

/**
 * Fractional index of the section under a horizontal reading line.
 * `tops` are section top offsets (ascending), `end` is the bottom of the last section.
 * Returns a value in [0, tops.length].
 */
export function sectionProgress(tops: readonly number[], end: number, line: number): number {
  const count = tops.length
  if (count === 0 || line < tops[0]!) return 0

  const index = tops.findLastIndex((top) => top <= line)
  const top = tops[index]!
  const bottom = index + 1 < count ? tops[index + 1]! : end
  const height = bottom - top
  if (height <= 0) return index + 1

  return index + Math.min((line - top) / height, 1)
}

/**
 * Blend weights for `count` shapes given a section progress from `sectionProgress`.
 * A shape is fully formed while the middle of its section is on screen and
 * cross-fades into the next one around the section boundary.
 */
export function shapeWeights(progress: number, count: number): number[] {
  if (count === 0) return []

  const shifted = Math.min(Math.max(progress - 0.5, 0), count - 1)
  const index = Math.floor(shifted)
  const t = smoothstep(TRANSITION_START, TRANSITION_END, shifted - index)

  return Array.from({ length: count }, (_, k) => {
    if (k === index) return 1 - t
    if (k === index + 1) return t
    return 0
  })
}
