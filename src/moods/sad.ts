/**
 * Sad — squashed eyes with their *inner* ends lifted steeply, sitting low, and
 * one big tear.
 *
 * Inner corners raised is the universal read for sadness, and it is the exact
 * mirror of Angry. That pair of opposite rotations is the cheapest, clearest
 * emotional signal there is.
 */

import type { MoodDef } from "../core/types";

export const sad = {
  id: "sad",
  label: "Sad",
  face: {
    left: { rx: 10.4, ry: 10.2, sq: 2.5, cy: 103, rot: -18 },
    right: { rx: 10.4, ry: 10.2, sq: 2.5, cy: 103, rot: 18 },
    tear: { op: 1, r: 7 },
  },
  // Slow heavy breathing, body sagging, gaze drifting down and slowly back.
  motion: {
    loopPeriod: 6.4,
    breath: 0.014,
    bob: 1.1,
    wobble: 0.55,
    sag: 3.5,
    gazeY: 2.6,
    gazeBias: 1,
    blinkEvery: 5.5,
    blinkDuration: 0.24,
  },
} satisfies MoodDef;
