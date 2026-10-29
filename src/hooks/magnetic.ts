export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

interface MagneticOptions {
  /** Fraction of the pointer's offset from the centre that the element follows. */
  strength?: number
  /** Pull radius beyond the element's edge, in px. */
  radius?: number
}

const DEFAULT_STRENGTH = 0.3
const DEFAULT_RADIUS = 48

/** How far an element should lean toward the pointer, or (0, 0) when the pointer is out of range. */
export function magneticOffset(
  pointer: { x: number; y: number },
  rect: Rect,
  { strength = DEFAULT_STRENGTH, radius = DEFAULT_RADIUS }: MagneticOptions = {},
): { x: number; y: number } {
  const dx = pointer.x - (rect.left + rect.width / 2)
  const dy = pointer.y - (rect.top + rect.height / 2)
  const isInRange = Math.abs(dx) <= rect.width / 2 + radius && Math.abs(dy) <= rect.height / 2 + radius
  return isInRange ? { x: dx * strength, y: dy * strength } : { x: 0, y: 0 }
}
