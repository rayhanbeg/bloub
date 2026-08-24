/**
 * Confused — one eye small and low, the other tall and high, both slightly
 * off-angle.
 *
 * Nothing lines up, which is what makes it read as puzzlement rather than as any
 * one clean emotion. Curious mismatches only the *height* of two otherwise
 * identical eyes; this mismatches size, height and rotation at once.
 */

import type { MoodDef } from "../core/types";

export const confused = {
  id: "confused",
  label: "Confused",
  face: {
    left: { rx: 8.2, ry: 11.6, sq: 2.8, cy: 105, rot: -6 },
    right: { rx: 11.2, ry: 18.8, sq: 2.4, cy: 97, rot: 4 },
  },
  // An off-kilter sway, as if hunting for an angle that makes sense.
  motion: { loopPeriod: 4.4, wobble: 1.2, lean: 4, tilt: 2.5, blinkEvery: 3 },
} satisfies MoodDef;
