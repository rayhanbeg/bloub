/**
 * Scared — tall narrow eyes with a small pupil floating high inside them, plus
 * cold sweat.
 *
 * Tall-and-narrow rather than big-and-round: round eyes read as Surprised, but
 * stretching them vertically reads as fear. The small high pupil leaves white
 * showing all the way around and underneath — the whites-of-the-eyes look — and
 * it is far smaller than Surprised's ring.
 */

import type { MoodDef } from "../core/types";

export const scared = {
  id: "scared",
  label: "Scared",
  face: {
    left: {
      rx: 9.6,
      ry: 18.8,
      sq: 2.2,
      cy: 99,
      pupil: { op: 1, dy: -2.8, r: 3.8 },
    },
    right: {
      rx: 9.6,
      ry: 18.8,
      sq: 2.2,
      cy: 99,
      pupil: { op: 1, dy: -2.8, r: 3.8 },
    },
    sweat: { op: 1 },
  },
  // Jittery trembling plus eyes darting side to side four times a loop.
  motion: {
    loopPeriod: 2.6,
    breath: 0.018,
    bob: 1,
    wobble: 0.7,
    tremble: 1.1,
    trembleHarmonic: 34,
    gazeX: 2.6,
    gazeXHarmonic: 4,
    blinkEvery: 2.2,
    blinkJitter: 0.8,
  },
} satisfies MoodDef;
