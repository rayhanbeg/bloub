/**
 * Nervous — eyes cutting sideways with their pupils, slightly mismatched in
 * height, plus one bead of sweat.
 *
 * Suspicious does the same side-eye slowly and from narrowed lids. Nervous does
 * it from eyes that are still wide, flicks the gaze three times a loop, and
 * blinks more often than any other mood. Watchfulness with no confidence in it.
 */

import type { MoodDef } from "../core/types";

export const nervous = {
  id: "nervous",
  label: "Nervous",
  face: {
    left: {
      rx: 9.4,
      ry: 14.8,
      sq: 2.5,
      cy: 100,
      pupil: { op: 1, dx: 3.6, dy: 0.8, r: 3.6 },
    },
    right: {
      rx: 9.4,
      ry: 13,
      sq: 2.5,
      cy: 101,
      pupil: { op: 1, dx: 3.6, dy: 0.8, r: 3.6 },
    },
    sweat: { op: 0.8 },
  },
  // A fine tremble, darting eyes, and the fastest blink rate of any mood.
  motion: {
    loopPeriod: 2.8,
    breath: 0.02,
    bob: 1.2,
    wobble: 0.7,
    tremble: 0.5,
    trembleHarmonic: 28,
    gazeX: 2,
    gazeXHarmonic: 3,
    blinkEvery: 2,
    blinkJitter: 0.6,
  },
} satisfies MoodDef;
