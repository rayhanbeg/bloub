/**
 * Sleepy — short, narrow slits sitting lower than any other mood's.
 *
 * They stay as thin *shapes* rather than closed arcs on purpose: the drowsy slow
 * blink is the whole point here, and a lid can only visibly fall if there is
 * something still open to close.
 */

import type { MoodDef } from "../core/types";

export const sleepy = {
  id: "sleepy",
  label: "Sleepy",
  face: {
    left: { rx: 8.6, ry: 3.2, sq: 3.4, cy: 107 },
    right: { rx: 8.6, ry: 3.2, sq: 3.4, cy: 107 },
  },
  // The slowest breath in the set, a held head-tilt, and a blink that takes well
  // over a second to close and reopen — all the way shut.
  motion: {
    loopPeriod: 7.5,
    breath: 0.028,
    bob: 2.2,
    wobble: 0.45,
    sag: 2.5,
    tilt: 4,
    blinkEvery: 3.2,
    blinkJitter: 0.7,
    blinkDuration: 1.3,
    blinkDepth: 1,
  },
} satisfies MoodDef;
