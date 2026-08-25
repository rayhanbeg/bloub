/**
 * Dizzy — two eyes that flatly disagree: one big round ring, one narrow and
 * tall, at different heights and opposite angles.
 *
 * Eyes that don't match read as "the room is spinning" in a way that matched
 * eyes never do. Confused mismatches its eyes too, but keeps both the same
 * *kind* of shape; here one has a pupil and the other doesn't.
 */

import type { MoodDef } from '../core/types'

export const dizzy = {
  id: 'dizzy',
  label: 'Dizzy',
  face: {
    left: {
      rx: 11.4,
      ry: 11.4,
      sq: 2,
      cy: 96,
      rot: 8,
      pupil: { op: 1, r: 4.8 },
    },
    right: { rx: 7.6, ry: 15.2, sq: 2.4, cy: 105, rot: -10 },
    sweat: { op: 0.65 },
  },
  // The widest lean in the set, plus a light tremble — genuinely unsteady.
  motion: {
    loopPeriod: 3,
    breath: 0.022,
    bob: 1.8,
    wobble: 1.6,
    lean: 6.5,
    tremble: 0.4,
    trembleHarmonic: 18,
    blinkEvery: 3,
  },
} satisfies MoodDef
