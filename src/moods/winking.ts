/**
 * Winking — one eye wide open, the other squeezed shut, with a light blush.
 *
 * The only mood where the two eyes use *different forms* at full strength: a
 * solid capsule on one side, a closed arc on the other.
 */

import type { MoodDef } from '../core/types'

export const winking = {
  id: 'winking',
  label: 'Winking',
  face: {
    left: { rx: 10.2, ry: 17.8, sq: 2.5, cy: 100 },
    right: { op: 0, cy: 100, arc: { op: 1, w: 14, bend: -9, thick: 5.6 } },
    blush: 0.5,
  },
  // A neat, deliberate little tilt — this one is in control of the joke.
  motion: {
    loopPeriod: 3.4,
    breath: 0.024,
    bob: 2.4,
    wobble: 1.3,
    tilt: -2,
    blinkEvery: 4.4,
  },
} satisfies MoodDef
