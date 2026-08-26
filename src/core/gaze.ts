/**
 * Where the eyes look when there's a cursor to look at.
 *
 * Pure maths and no DOM, same rule as `idle.ts` and `intro.ts`: the caller
 * measures, this decides. And like `intro.ts`, nothing here reaches the exporters
 * — an exported GIF has no mouse to follow — so this is preview-only.
 *
 * The whole problem is one of restraint. Eyes that track a cursor perfectly look
 * like a security camera; eyes that barely move look broken. What reads as *alive*
 * is a small, bounded deflection that saturates: the blob glances toward you and
 * then stops caring how much further away you get.
 */

/**
 * How far the eyes may travel, in viewBox units — an ellipse, not a circle.
 *
 * Each eye is 28 units across and 26.4 tall, and the two sit 48 apart with a
 * 20-unit gap between them. So 4.4 sideways is under a third of an eye's own
 * radius: unmistakable in motion, nowhere near enough to slide an eye off the
 * face. Vertical is tighter because there is less room above the eyes than there
 * is beside them.
 */
export const FOLLOW_REACH = { x: 4.4, y: 3.2 } as const

/**
 * Distance at which the eyes are ~63% deflected, in half-widths of the blob's
 * box. Just under 1 means a cursor at the blob's own edge already reads as a
 * proper look, which is where most of the pointing happens.
 */
const FALLOFF = 0.9

/** A gaze offset, in the same viewBox units as `MoodMotion.gazeX`. */
export interface Gaze {
  x: number
  /** Negative looks up. */
  y: number
}

export const AT_REST: Gaze = { x: 0, y: 0 }

/**
 * The gaze that looks toward a point.
 *
 * Direction is taken exactly and *magnitude* is where the judgement lives, so the
 * eyes always point at the cursor even when they're only halfway committed to it.
 *
 * @param nx Horizontal distance from the face to the cursor, measured in
 *   half-widths of the blob's box — 1 is "at the edge", 3 is "well off to the
 *   side". Normalising this way is what lets a 140px card and a 480px hero behave
 *   identically.
 * @param ny The same, vertically. Negative is above the face.
 */
export function gazeToward(nx: number, ny: number): Gaze {
  const distance = Math.hypot(nx, ny)
  // Directly on the face: no direction to point in, and nothing to point at.
  if (distance < 1e-4) return AT_REST

  /*
   * Saturating, so a cursor in the far corner of a wide monitor pulls no harder
   * than one just outside the blob — past a certain point, "over there" is simply
   * "over there". `1 - e^-d` has no seam to run into either: unlike a clamp, the
   * approach to full deflection slows down on its own, so the eyes never arrive
   * at their limit with velocity still on them.
   */
  const pull = 1 - Math.exp(-distance / FALLOFF)

  return {
    x: (nx / distance) * pull * FOLLOW_REACH.x,
    y: (ny / distance) * pull * FOLLOW_REACH.y,
  }
}
