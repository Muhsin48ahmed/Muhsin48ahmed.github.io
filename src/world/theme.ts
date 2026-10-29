import spaceGroteskBold from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff?url'
import jetbrainsMono from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url'

/** Fonts for 3D text (troika needs .woff, not .woff2). */
export const DISPLAY_FONT = spaceGroteskBold
export const MONO_FONT = jetbrainsMono

export const INK = '#04050a'
export const CYAN = '#22d3ee'
export const VIOLET = '#8b5cf6'
export const PINK = '#e879f9'
export const LIME = '#a3e635'
export const ACCENTS = [CYAN, VIOLET, PINK, LIME] as const

/** Emissive colours above 1.0 so they cross the bloom threshold. */
export const GLOW = 2.4
