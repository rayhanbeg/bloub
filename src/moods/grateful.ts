/**
 * Grateful — closed arcs tipped steeply *inward*, so the pair bows toward each
 * other, sitting a little low.
 *
 * The mirrored `rot: 16` is the whole idea: dropping the inner ends turns a
 * plain happy squint into a small bow. Warmth aimed at someone else, where
 * Blissful's warmth is aimed at nobody in particular.
 */

import type { MoodDef } from "../core/types";

export const grateful = {
  id: "grateful",
  label: "Grateful",
  face: {
    left: {
      op: 0,
      cy: 102,
      arc: { op: 1, w: 13, bend: -6, thick: 5.2, rot: 16 },
    },
    right: {
      op: 0,
      cy: 102,
      arc: { op: 1, w: 13, bend: -6, thick: 5.2, rot: -16 },
    },
    blush: 0.5,
  },
  // An unhurried breath with the body settling gently down — a nod, not a bounce.
  motion: {
    loopPeriod: 5,
    breath: 0.026,
    bob: 2,
    wobble: 0.9,
    sag: 1.5,
    blinkEvery: 5.2,
  },
} satisfies MoodDef;
