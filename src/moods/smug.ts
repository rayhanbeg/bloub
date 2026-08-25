/**
 * Smug — one eye narrowed to a slit, the other left half-open, both riding high
 * in the face.
 *
 * The asymmetry is the whole expression, and it's what keeps Smug out of Sneaky's
 * territory: a clean mirrored V is a plan, but one eye lazier than the other is
 * *knowing* — the closest thing to a smirk that eyes alone can manage. Height
 * does the rest. Lids high with the body lifted reads as looking down at you,
 * where Cool sits level and Bored sits low.
 */

import type { MoodDef } from '../core/types'

export const smug = {
  id: 'smug',
  label: 'Smug',
  face: {
    left: { rx: 11, ry: 4.6, sq: 3.2, cy: 96, rot: 6 },
    right: { rx: 10.6, ry: 9.4, sq: 2.8, cy: 97, rot: -3 },
  },
  // Lifted, tilted and slow. Nothing here is in a hurry to be impressed.
  motion: {
    loopPeriod: 4.4,
    breath: 0.02,
    bob: 1.4,
    wobble: 0.7,
    sag: -2,
    tilt: -3.5,
    blinkEvery: 5.4,
    blinkDuration: 0.2,
  },
} satisfies MoodDef
