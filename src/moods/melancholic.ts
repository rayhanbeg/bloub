/**
 * Melancholic — half-lidded eyes sitting low and shifted bodily to one side.
 * No tear.
 *
 * Sad is acute: slanted, tearful, sagging hard. This is the long quiet version —
 * nothing is distorted, the eyes have simply drifted off centre and settled
 * down. The sideways shift is the tell that separates it from Cool, which sits
 * dead centre and much wider.
 */

import type { MoodDef } from "../core/types";

export const melancholic = {
  id: "melancholic",
  label: "Melancholic",
  face: {
    left: { cx: 73, cy: 107, rx: 10, ry: 9, sq: 2.5 },
    right: { cx: 113, cy: 107, rx: 10, ry: 9, sq: 2.5 },
  },
  // Very slow and heavy, tilted, with the gaze resting downward throughout.
  motion: {
    loopPeriod: 6.8,
    breath: 0.014,
    bob: 1.1,
    wobble: 0.5,
    sag: 3,
    tilt: 2,
    gazeY: 2,
    gazeBias: 1.4,
    blinkEvery: 5.6,
    blinkDuration: 0.3,
  },
} satisfies MoodDef;
