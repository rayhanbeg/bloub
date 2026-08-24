/**
 * Embarrassed — eyes screwed shut into short, thick, low arcs. Full blush, a
 * bead of sweat, and a body shrinking away.
 *
 * A wince. These are the narrowest closed arcs in the set (`w: 11.5`), which is
 * what makes them read as *clenched* rather than happy, and the `scale` under 1
 * is the face wishing it were somewhere else.
 */

import type { MoodDef } from "../core/types";

export const embarrassed = {
  id: "embarrassed",
  label: "Embarrassed",
  face: {
    left: { op: 0, cy: 104, arc: { op: 1, w: 11.5, bend: -3.5, thick: 5.8 } },
    right: { op: 0, cy: 104, arc: { op: 1, w: 11.5, bend: -3.5, thick: 5.8 } },
    blush: 1,
    sweat: { op: 0.5 },
  },
  // Shrinking and sinking, with a small tremble underneath.
  motion: {
    loopPeriod: 3.4,
    breath: 0.03,
    bob: 1.6,
    wobble: 0.8,
    sag: 2,
    scale: 0.955,
    tremble: 0.3,
    trembleHarmonic: 24,
    blinkEvery: 3,
  },
} satisfies MoodDef;
