/**
 * Blissful — wide, heavy, almost-flat closed lids.
 *
 * Separated from the rest of the closed-arc family by **weight**: `thick: 7.6`
 * is the heaviest lid here, and a heavy lid on a shallow curve reads as deeply
 * relaxed. Laughing is thin and deeply bent; this is the exact opposite.
 */

import type { MoodDef } from '../core/types'

export const blissful = {
  id: 'blissful',
  label: 'Blissful',
  face: {
    left: { op: 0, cy: 101, arc: { op: 1, w: 15.5, bend: -5, thick: 7.2 } },
    right: { op: 0, cy: 101, arc: { op: 1, w: 15.5, bend: -5, thick: 7.2 } },
    blush: 0.85,
  },
  // Almost the slowest loop in the set, floating very slightly upward.
  motion: {
    loopPeriod: 6.2,
    breath: 0.03,
    bob: 2.2,
    wobble: 0.7,
    sag: -1,
    blinkEvery: 6,
  },
} satisfies MoodDef
