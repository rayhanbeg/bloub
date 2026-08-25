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
import { EYE } from '../core/face'

export const excited = {
  id: 'excited',
  label: 'Excited',
  face: {
    left: { ...EYE.open, ry: 14.4, cy: 97 },
    right: { ...EYE.open, ry: 14.4, cy: 97 },
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
