/**
 * Cool — wide, level, half-lidded lenses.
 *
 * The sunglasses read without any sunglasses. The trick is that these are
 * *half-open lids*, not slits: keeping real height (`ry: 7.4`) is what makes it
 * unbothered rather than asleep, and the extra width is what makes it confident
 * rather than deadpan. Unimpressed is this same idea with the height removed.
 */

import type { MoodDef } from '../core/types'

export const cool = {
  id: 'cool',
  label: 'Cool',
  face: {
    left: { rx: 12, ry: 7.4, sq: 3.1, cy: 103 },
    right: { rx: 12, ry: 7.4, sq: 3.1, cy: 103 },
  },
  // Unhurried and level, with slow rare blinks. Nothing rattles this one.
  motion: {
    loopPeriod: 4.6,
    breath: 0.018,
    bob: 1.5,
    wobble: 0.6,
    tilt: -1.5,
    blinkEvery: 5.8,
    blinkDuration: 0.2,
  },
} satisfies MoodDef
