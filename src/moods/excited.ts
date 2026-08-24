/**
 * Excited — the biggest, roundest *open* eyes in the set, lifted high, with a
 * blush.
 *
 * `sq: 2.1` is nearly a true ellipse, which is softer than Neutral's rounded
 * capsule and much softer than any of the narrowed moods. Big, round and soft is
 * the whole recipe; the hop in the motion does the rest.
 */

import type { MoodDef } from "../core/types";

export const excited = {
  id: "excited",
  label: "Excited",
  face: {
    left: { rx: 11.4, ry: 18.2, sq: 2.1, cy: 97 },
    right: { rx: 11.4, ry: 18.2, sq: 2.1, cy: 97 },
    blush: 0.5,
  },
  // The fastest breathing of any mood, plus a hop once per loop.
  motion: {
    loopPeriod: 1.7,
    breath: 0.038,
    bob: 3.6,
    wobble: 1.8,
    hop: 5.5,
    blinkEvery: 2.6,
    blinkJitter: 0.9,
    blinkDuration: 0.12,
  },
} satisfies MoodDef;
