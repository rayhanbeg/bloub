/**
 * Unimpressed — two thin level slits, centred, no slant at all.
 *
 * The deadpan sits exactly between Angry and Sad: the same flat dashes at zero
 * rotation. Taking the tilt away takes the emotion away, which is the joke.
 * Unlike Bored, it is still looking right at you.
 */

import type { MoodDef } from "../core/types";

export const unimpressed = {
  id: "unimpressed",
  label: "Unimpressed",
  face: {
    left: { rx: 10.2, ry: 3.6, sq: 3.6, cy: 100 },
    right: { rx: 10.2, ry: 3.6, sq: 3.6, cy: 100 },
  },
  // Minimal movement — barely engaged enough to breathe.
  motion: {
    loopPeriod: 5.4,
    breath: 0.012,
    bob: 0.9,
    wobble: 0.35,
    blinkEvery: 5.2,
  },
} satisfies MoodDef;
