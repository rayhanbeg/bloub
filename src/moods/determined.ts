/**
 * Determined — eyes narrowed from above rather than shut, under low level brows.
 *
 * Angry with the hostility taken out. The eyes stay properly open, the slant is
 * mild (9° against Angry's 22°), and the brows are *straight* — set, not
 * furrowed. Braced for something rather than mad at it.
 */

import type { MoodDef } from '../core/types'

export const determined = {
  id: 'determined',
  label: 'Determined',
  face: {
    left: {
      rx: 10.4,
      ry: 9.8,
      sq: 2.7,
      cy: 100,
      rot: 9,
      brow: { op: 1, dy: -19, w: 12.5, bend: 0, thick: 4.2, rot: 10 },
    },
    right: {
      rx: 10.4,
      ry: 9.8,
      sq: 2.7,
      cy: 100,
      rot: -9,
      brow: { op: 1, dy: -19, w: 12.5, bend: 0, thick: 4.2, rot: -10 },
    },
  },
  // Braced: compressed, steady, faster than Neutral but not agitated.
  motion: {
    loopPeriod: 2.6,
    breath: 0.024,
    bob: 1.3,
    wobble: 0.65,
    squash: 0.985,
    blinkEvery: 4.4,
  },
} satisfies MoodDef
