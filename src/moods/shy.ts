/**
 * Shy — small, narrow, *open* eyes sitting low and drawn closer together, with
 * the strongest blush in the set.
 *
 * Open eyes are the difference from Embarrassed, which screws them shut. What
 * makes this timid rather than merely small is the narrowed gap: pulling the pair
 * inward shrinks the face inside the body, and a face with room around it reads
 * as young and unsure. Melancholic also moves its eyes, but *sideways* and much
 * lower — drifting away rather than curling in.
 */

import type { MoodDef } from '../core/types'

export const shy = {
  id: 'shy',
  label: 'Shy',
  face: {
    left: { cx: 81, rx: 7.8, ry: 13.4, sq: 2.6, cy: 103 },
    right: { cx: 119, rx: 7.8, ry: 13.4, sq: 2.6, cy: 103 },
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
} satisfies MoodDef
