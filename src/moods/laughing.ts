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
import { EYE } from '../core/face'

export const laughing = {
  id: 'laughing',
  label: 'Laughing',
  face: {
    left: { ...EYE.closed, cy: 96, arc: { op: 1, w: 13.6, bend: -9.2, thick: 5.8 } },
    right: { ...EYE.closed, cy: 96, arc: { op: 1, w: 13.6, bend: -9.2, thick: 5.8 } },
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
