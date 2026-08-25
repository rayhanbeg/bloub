/**
 * Angry — thin dashes slanted so their inner ends drive down, under matching
 * steep brows.
 *
 * Angry and Sad are the same idea at opposite rotations, and this is the steeper
 * of the two (22°). The brows double the slant instead of introducing a new
 * direction, which keeps the whole face pointing at one thing.
 */

import type { MoodDef } from '../core/types'

export const angry = {
  id: 'angry',
  label: 'Angry',
  face: {
    left: {
      rx: 10.2,
      ry: 3.6,
      sq: 3,
      cy: 100,
      rot: 24,
      brow: { op: 1, dy: -21, w: 12.5, bend: -2, thick: 4.8, rot: 24 },
    },
    right: {
      rx: 10.2,
      ry: 3.6,
      sq: 3,
      cy: 100,
      rot: -24,
      brow: { op: 1, dy: -21, w: 12.5, bend: -2, thick: 4.8, rot: -24 },
    },
  },
  // Sharp shallow breaths, body held compressed, and the fastest vibration in the
  // set — the tell that something is being suppressed.
  motion: {
    loopPeriod: 2.4,
    breath: 0.026,
    bob: 1.2,
    wobble: 0.8,
    squash: 0.975,
    tremble: 0.75,
    trembleHarmonic: 30,
    blinkEvery: 3.2,
  },
} satisfies MoodDef
