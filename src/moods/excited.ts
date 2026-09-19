/**
 * Excited — the biggest, roundest *open* eyes in the set, lifted high, with a
 * blush.
 *
 * `sq: 2.05` is all but a true ellipse, which is softer than Neutral's rounded
 * capsule and much softer than any of the narrowed moods, and the extra width
 * makes them read as *bubbly* rather than merely large. Big, round and soft is
 * the whole recipe; Amazed reaches the same size but adds brows, and Surprised
 * punches a hole. The hop in the motion does the rest.
 */

import type { MoodDef } from '../core/types'


export const excited = {
  id: 'excited',
  label: 'Excited',
  face: {
    // Spelled out rather than built from `EYE.open`, because the preset's
    // `sq: 3.2` is precisely the rounded-square this mood is supposed to be the
    // exception to. Borrowing it made Excited a slightly taller Neutral — and a
    // near-twin of Curious, which is also built on the same preset.
    left: { rx: 15, ry: 14.4, sq: 2.05, cy: 97, op: 1, arc: { op: 0 } },
    right: { rx: 15, ry: 14.4, sq: 2.05, cy: 97, op: 1, arc: { op: 0 } },
    blush: 0.6,
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
} satisfies MoodDef
