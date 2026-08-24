/**
 * Mischievous — chunky tilted crescents with both pupils shoved to one side.
 *
 * Sneaky's cousin, separated from it by weight: Sneaky is two thin flat dashes
 * creeping along, while these are half-open crescents with visible pupils
 * cutting sideways at something. Scheming, and enjoying it.
 */

import type { MoodDef } from "../core/types";

export const mischievous = {
  id: "mischievous",
  label: "Mischievous",
  face: {
    left: {
      rx: 11.2,
      ry: 7.6,
      sq: 2.4,
      cy: 98,
      rot: 13,
      pupil: { op: 1, dx: 4, dy: 0, r: 3.4 },
    },
    right: {
      rx: 11.2,
      ry: 7.6,
      sq: 2.4,
      cy: 98,
      rot: -13,
      pupil: { op: 1, dx: 4, dy: 0, r: 3.4 },
    },
    blush: 0.4,
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
} satisfies MoodDef;
