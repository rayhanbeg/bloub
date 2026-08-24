/**
 * Suspicious — narrowed eyes at mismatched angles with both pupils dragged to
 * the outside: a side-eye.
 *
 * The pupils are what make it. Sneaky *glances* sideways by moving the whole
 * eye; here the eyes stay put and only the pupils slide, which is exactly the
 * difference between looking at something and not trusting it.
 */

import type { MoodDef } from "../core/types";

export const suspicious = {
  id: "suspicious",
  label: "Suspicious",
  face: {
    left: {
      rx: 10.6,
      ry: 6.2,
      sq: 3,
      cy: 100,
      rot: 8,
      pupil: { op: 1, dx: -4.2, dy: 0, r: 2.9 },
    },
    right: {
      rx: 10.6,
      ry: 6.2,
      sq: 3,
      cy: 101,
      rot: 3,
      pupil: { op: 1, dx: -4.2, dy: 0, r: 2.9 },
    },
  },
  // Still and watchful, with one slow sweep per loop.
  motion: {
    loopPeriod: 5,
    breath: 0.016,
    bob: 1.2,
    wobble: 0.5,
    gazeX: 2.2,
    gazeXHarmonic: 1,
    blinkEvery: 4.6,
  },
} satisfies MoodDef;
