/**
 * Frustrated — eyes clamped shut into flat, thick bands under steep brows, plus
 * a bead of sweat.
 *
 * The only mood with `bend: 0` on a closed eye. Every other shut pair curves one
 * way or the other; a dead-flat band reads as *pressed* shut. The steep brows
 * above supply the anger the eyes can no longer show.
 */

import type { MoodDef } from "../core/types";

export const frustrated = {
  id: "frustrated",
  label: "Frustrated",
  face: {
    left: {
      op: 0,
      cy: 101,
      arc: { op: 1, w: 13, bend: 0, thick: 6.6, rot: 6 },
      brow: { op: 1, dy: -13, w: 12, bend: -1.5, thick: 4.6, rot: 17 },
    },
    right: {
      op: 0,
      cy: 101,
      arc: { op: 1, w: 13, bend: 0, thick: 6.6, rot: -6 },
      brow: { op: 1, dy: -13, w: 12, bend: -1.5, thick: 4.6, rot: -17 },
    },
    sweat: { op: 0.6 },
  },
  // Held compressed with a hard tremble — something being contained, badly.
  motion: {
    loopPeriod: 2.4,
    breath: 0.028,
    bob: 1.3,
    wobble: 0.85,
    squash: 0.98,
    tremble: 0.6,
    trembleHarmonic: 24,
    blinkEvery: 3.4,
  },
} satisfies MoodDef;
