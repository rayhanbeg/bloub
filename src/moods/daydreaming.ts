/**
 * Daydreaming — half-lidded eyes riding high in the face, tipped the *same* way
 * as each other and slightly out of step.
 *
 * Thinking narrows its eyes because it's working; this one has stopped working.
 * Three tricks sell it: eyes riding high, so the face is looking up and away; a
 * parallel tilt, which reads as unfocused where a mirrored tilt would read as an
 * expression; and a height difference between the two — enough to look absent,
 * not enough to look like Confused's mistake.
 *
 * They have to be *wider than tall* for any of that to land. A tilt is invisible
 * on a tall oval, because rotating something nearly symmetrical barely changes
 * its silhouette — the first version of this mood tilted 9° and read as plain
 * Neutral sitting high.
 */

import type { MoodDef } from '../core/types'

export const daydreaming = {
  id: 'daydreaming',
  label: 'Daydreaming',
  face: {
    left: { rx: 10.8, ry: 9.8, sq: 2.3, cy: 95, rot: -11 },
    right: { rx: 10.8, ry: 8.4, sq: 2.3, cy: 97.5, rot: -11 },
    blush: 0.3,
  },
  // The longest loop apart from Sleepy, with a wide dreamy lean and an upward gaze.
  motion: {
    loopPeriod: 7,
    breath: 0.026,
    bob: 2.4,
    wobble: 0.8,
    lean: 5,
    sag: -1.5,
    gazeX: 2.6,
    gazeXHarmonic: 1,
    gazeY: -2,
    blinkEvery: 5.6,
    blinkDuration: 0.28,
  },
} satisfies MoodDef
