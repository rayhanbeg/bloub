/**
 * Smug — narrow lids sitting *high* in the face, tipped inward, head cocked.
 *
 * Height is what separates this from every other narrowed-eye mood. Lids high
 * with the body lifted reads as looking down at you; Cool sits level and Bored
 * sits low. The head tilt keeps it amused rather than hostile.
 */

import type { MoodDef } from "../core/types";

export const smug = {
  id: "smug",
  label: "Smug",
  face: {
    left: { rx: 11, ry: 5, sq: 3.1, cy: 96, rot: 8 },
    right: { rx: 11, ry: 5, sq: 3.1, cy: 96, rot: -8 },
  },
  // Lifted, tilted and slow. Nothing here is in a hurry to be impressed.
  motion: {
    loopPeriod: 4.4,
    breath: 0.02,
    bob: 1.4,
    wobble: 0.7,
    sag: -2,
    tilt: -3.5,
    blinkEvery: 5.4,
    blinkDuration: 0.2,
  },
} satisfies MoodDef;
