export interface StatParts {
  prefix: string
  target: number
  decimals: number
  suffix: string
}

// A single number with optional decimals. Grouped numbers ("1,200") are left alone rather than miscounted.
const STAT_PATTERN = /^([^\d,]*)(\d+(?:\.(\d+))?)([^\d,]*)$/

/** Splits a stat like "53k+" or "<2s" into the number to count and the text around it; null if it can't. */
export function parseStat(value: string): StatParts | null {
  const match = STAT_PATTERN.exec(value)
  if (!match) return null
  const [, prefix = '', number = '', fraction = '', suffix = ''] = match
  return { prefix, target: Number(number), decimals: fraction.length, suffix }
}

/** The stat as it reads part-way through counting up; progress 1 gives back the original text. */
export function formatCount({ prefix, target, decimals, suffix }: StatParts, progress: number): string {
  return `${prefix}${(target * progress).toFixed(decimals)}${suffix}`
}

/** Fast start, long settle: matches the site's --ease-out-expo. */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
