/**
 * Sneaky — thin dashes slanted into a matched V, creeping sideways.
 *
 * Symmetry is what separates this from Suspicious, whose slants are
 * deliberately uneven. A clean mirrored V is a plan; a lopsided one is a doubt.
 */

import type { MoodDef } from '../core/types'

export const sneaky = {
  id: 'sneaky',
  label: 'Sneaky',
  face: {
    left: { rx: 10.2, ry: 3.8, sq: 3.3, cy: 102, rot: 14 },
    right: { rx: 10.2, ry: 3.8, sq: 3.3, cy: 102, rot: -14 },
  },
  // Creeping: slow, quiet, with one long sideways glance per loop.
  motion: {
    loopPeriod: 4.8,
    breath: 0.018,
    bob: 1.3,
    wobble: 0.55,
    tilt: 2,
    gazeX: 3,
    gazeXHarmonic: 1,
    blinkEvery: 4.8,
  },
} satisfies MoodDef
