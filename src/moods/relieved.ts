/**
 * Relieved — eyes closed into long, thin, nearly level arcs, plus one bead of
 * cooling sweat.
 *
 * The sweat is what makes this "phew" rather than "content" — the same garnish
 * Nervous and Scared use, kept here as the residue of something that has just
 * stopped being a problem. The long exhale in the motion does the rest.
 */

import type { MoodDef } from "../core/types";

export const relieved = {
  id: "relieved",
  label: "Relieved",
  face: {
    left: { op: 0, cy: 102, arc: { op: 1, w: 16, bend: -2, thick: 4.4 } },
    right: { op: 0, cy: 102, arc: { op: 1, w: 16, bend: -2, thick: 4.4 } },
    sweat: { op: 0.55 },
  },
  // The deepest breath in the set — a long slow exhale, settling downward.
  motion: {
    loopPeriod: 5.5,
    breath: 0.042,
    bob: 2.6,
    wobble: 0.8,
    sag: 1.5,
    blinkEvery: 5,
  },
} satisfies MoodDef;
