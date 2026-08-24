/**
 * Daydreaming — tall soft eyes riding high, tipped the *same* way as each other
 * and very slightly out of step.
 *
 * Thinking narrows its eyes because it's working; this one has stopped working.
 * Two tricks sell it: a parallel tilt, which reads as unfocused where a mirrored
 * tilt would read as an expression, and a one-unit height difference between the
 * eyes — enough to look absent, not enough to look like Confused's mistake.
 */

import type { MoodDef } from "../core/types";

export const daydreaming = {
  id: "daydreaming",
  label: "Daydreaming",
  face: {
    left: { rx: 10.4, ry: 14.6, sq: 2.2, cy: 96, rot: -8 },
    right: { rx: 10.4, ry: 13.4, sq: 2.2, cy: 98, rot: -8 },
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
} satisfies MoodDef;
