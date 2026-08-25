/**
 * Crying — eyes screwed shut into *downward* arcs, with the biggest tear in the
 * set.
 *
 * The only mood with a positive `bend` on both eyes. Every happy squint curves
 * up; flipping the same primitive over is all it takes, and the sobbing hitch in
 * the motion does the rest.
 */

import type { MoodDef } from '../core/types'

export const crying = {
  id: 'crying',
  label: 'Crying',
  face: {
    left: { op: 0, cy: 102, arc: { op: 1, w: 14, bend: 7.5, thick: 5.4 } },
    right: { op: 0, cy: 102, arc: { op: 1, w: 14, bend: 7.5, thick: 5.4 } },
    tear: { op: 1, r: 7.5 },
  },
  // Sobbing: fast shallow breaths with a hitch (the tremble) layered on top.
  motion: {
    loopPeriod: 2.2,
    breath: 0.03,
    bob: 1.6,
    wobble: 0.9,
    sag: 2.5,
    tremble: 0.55,
    trembleHarmonic: 22,
    blinkEvery: 2.4,
  },
} satisfies MoodDef
