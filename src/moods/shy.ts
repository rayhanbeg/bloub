/**
 * Shy — small, narrow, *open* eyes sitting low, full blush, looking away.
 *
 * Open eyes are the difference from Embarrassed, which screws them shut. Shy is
 * still willing to look — just not for long, hence the slow glance away and the
 * body drawing itself in a few percent smaller.
 */

import type { MoodDef } from "../core/types";

export const shy = {
  id: "shy",
  label: "Shy",
  face: {
    left: { rx: 7.8, ry: 13.4, sq: 2.6, cy: 103 },
    right: { rx: 7.8, ry: 13.4, sq: 2.6, cy: 103 },
    blush: 1,
  },
  // Drawn back and slightly smaller, with a slow look-away once per loop.
  motion: {
    loopPeriod: 5.6,
    breath: 0.03,
    bob: 1.4,
    wobble: 0.5,
    sag: 1.5,
    scale: 0.96,
    gazeX: 3,
    gazeXHarmonic: 1,
    gazeBias: 1.2,
    blinkEvery: 3.6,
  },
} satisfies MoodDef;
