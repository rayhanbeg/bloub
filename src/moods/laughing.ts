/**
 * Laughing — eyes squeezed shut into the deepest, narrowest arcs in the set,
 * riding high.
 *
 * `bend: -11.5` on `w: 12` is a hard squeeze rather than a gentle one, and it's
 * the clearest use of the two-forms-per-eye trick: the solid capsule fades out
 * while the arc fades in, and because both are moving and resizing at the same
 * time, the switch reads as a squint rather than a swap.
 */

import type { MoodDef } from '../core/types'

export const laughing = {
  id: 'laughing',
  label: 'Laughing',
  face: {
    left: { op: 0, cy: 96, arc: { op: 1, w: 12, bend: -11.5, thick: 6.2 } },
    right: { op: 0, cy: 96, arc: { op: 1, w: 12, bend: -11.5, thick: 6.2 } },
    blush: 0.4,
  },
  // Fast and big, with a shake layered on so the whole body laughs too.
  motion: {
    loopPeriod: 1.9,
    breath: 0.034,
    bob: 3.4,
    wobble: 2,
    tremble: 0.35,
    trembleHarmonic: 16,
    blinkEvery: 3,
  },
} satisfies MoodDef
