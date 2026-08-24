/**
 * Bored — dashes drooping in *parallel*, sitting low, gaze wandering off.
 *
 * Every other slanted mood mirrors its two eyes. Tilting both the same way reads
 * as a droop rather than as an expression, which is precisely the point:
 * Unimpressed is looking at you and not caring, Bored has stopped looking.
 */

import type { MoodDef } from "../core/types";

export const bored = {
  id: "bored",
  label: "Bored",
  face: {
    left: { rx: 10, ry: 4.2, sq: 3.2, cy: 106, rot: -9 },
    right: { rx: 10, ry: 4.2, sq: 3.2, cy: 106, rot: -9 },
  },
  // Long slow sighing breaths, a sag, and a gaze that drifts away and stays away.
  motion: {
    loopPeriod: 6,
    breath: 0.016,
    bob: 1,
    wobble: 0.4,
    sag: 2,
    gazeX: 2.8,
    gazeXHarmonic: 1,
    gazeBias: 0.8,
    blinkEvery: 5.8,
    blinkDuration: 0.26,
  },
} satisfies MoodDef;
