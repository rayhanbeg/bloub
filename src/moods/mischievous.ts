/**
 * Mischievous — half-open crescents tipped so their *inner* ends lift, with both
 * pupils cutting off to one side and a light blush.
 *
 * Sneaky's cousin, and the two are separated by the direction of the tilt.
 * Sneaky's inner ends drive *down* into a mirrored V, which is a creeping,
 * calculating shape; lifting them instead gives the impish, cat-like arch that
 * means someone is about to enjoy themselves. The visible pupils aim that
 * intention at a target, and the blush says it's mischief rather than malice.
 */

import type { MoodDef } from '../core/types'

export const mischievous = {
  id: 'mischievous',
  label: 'Mischievous',
  face: {
    left: {
      rx: 11,
      ry: 7.2,
      sq: 2.4,
      cy: 98,
      rot: -16,
      pupil: { op: 1, dx: 3.6, dy: 0, r: 3 },
    },
    right: {
      rx: 11,
      ry: 7.2,
      sq: 2.4,
      cy: 98,
      rot: 16,
      pupil: { op: 1, dx: 3.6, dy: 0, r: 3 },
    },
    blush: 0.45,
  },
  // Bouncy and tilted, with the gaze flicking back and forth twice a loop.
  motion: {
    loopPeriod: 3,
    breath: 0.026,
    bob: 2.4,
    wobble: 1.6,
    lean: 3,
    tilt: 2,
    gazeX: 1.8,
    gazeXHarmonic: 2,
    blinkEvery: 3.2,
  },
} satisfies MoodDef
