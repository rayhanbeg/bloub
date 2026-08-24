/**
 * Skeptical — one brow up, one down, over two eyes of very different heights.
 *
 * The single raised brow is such a strong signal that it needs almost nothing
 * else. The narrowed eye under the *lowered* brow and the open one under the
 * raised brow are only there so each half of the face agrees with its own brow.
 */

import type { MoodDef } from "../core/types";

export const skeptical = {
  id: "skeptical",
  label: "Skeptical",
  face: {
    left: {
      rx: 10.4,
      ry: 7.2,
      sq: 2.9,
      cy: 102,
      brow: { op: 1, dy: -16, w: 12, bend: -2.5, thick: 4, rot: 9 },
    },
    right: {
      rx: 10.2,
      ry: 15.4,
      sq: 2.5,
      cy: 100,
      brow: { op: 1, dy: -28, w: 12, bend: -5, thick: 4, rot: -5 },
    },
  },
  // Still and slightly tilted, with one unconvinced sideways look per loop.
  motion: {
    loopPeriod: 4.8,
    breath: 0.016,
    bob: 1.2,
    wobble: 0.6,
    tilt: -2,
    gazeX: 1.6,
    gazeXHarmonic: 1,
    blinkEvery: 5,
  },
} satisfies MoodDef;
