/**
 * Proud — thin, relaxed closed arcs sitting higher than any other mood's, over a
 * body that lifts itself.
 *
 * Shallower than Happy and thinner than Blissful, with the negative `sag` doing
 * the real work: chin up. Content rather than delighted, and pleased with
 * itself rather than with you.
 */

import type { MoodDef } from '../core/types'

export const proud = {
  id: 'proud',
  label: 'Proud',
  face: {
    left: {
      op: 0,
      cy: 95,
      arc: { op: 1, w: 15.5, bend: -4.5, thick: 4.2, dy: -1 },
    },
    right: {
      op: 0,
      cy: 95,
      arc: { op: 1, w: 15.5, bend: -4.5, thick: 4.2, dy: -1 },
    },
  },
  // Chin up: a negative sag lifts the whole body, and it breathes unhurriedly.
  motion: {
    loopPeriod: 4.8,
    breath: 0.024,
    bob: 1.4,
    wobble: 0.8,
    sag: -4,
    tilt: -1.5,
    blinkEvery: 5,
  },
} satisfies MoodDef
