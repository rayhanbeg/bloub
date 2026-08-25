/**
 * Playful — closed happy arcs with a ripple running through them: `≈ ≈`.
 *
 * The only mood that puts `wave` on the eyes, which makes it instantly findable
 * in a grid of thumbnails. A squiggle is the most cartoonish thing the curve
 * primitive can do, and it lands as goofy delight.
 */

import type { MoodDef } from '../core/types'

export const playful = {
  id: 'playful',
  label: 'Playful',
  face: {
    left: {
      op: 0,
      cy: 99,
      arc: { op: 1, w: 14, bend: -6, thick: 5.4, wave: 3.4 },
    },
    right: {
      op: 0,
      cy: 99,
      arc: { op: 1, w: 14, bend: -6, thick: 5.4, wave: 3.4 },
    },
    blush: 0.5,
  },
  // The loosest motion in the set: high wobble, a wide lean, and a hop.
  motion: {
    loopPeriod: 2.2,
    breath: 0.032,
    bob: 3.2,
    wobble: 2.1,
    lean: 4,
    hop: 4.5,
    blinkEvery: 2.6,
    blinkJitter: 1,
  },
} satisfies MoodDef
