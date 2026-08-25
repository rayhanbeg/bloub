/**
 * Love-struck — deep closed arcs tipped *outward*, full blush, floating.
 *
 * The opposite rotation to Grateful: lifting the inner ends makes the eyes look
 * like they're melting upward. No heart shapes — they would need a primitive
 * nothing else uses, and the giddy sway sells it without one.
 */

import type { MoodDef } from '../core/types'

export const lovestruck = {
  id: 'lovestruck',
  label: 'Love-struck',
  face: {
    left: {
      op: 0,
      cy: 98,
      arc: { op: 1, w: 15, bend: -9, thick: 5.2, rot: -9 },
    },
    right: {
      op: 0,
      cy: 98,
      arc: { op: 1, w: 15, bend: -9, thick: 5.2, rot: 9 },
    },
    blush: 1,
  },
  // Floating and swaying — a dreamy lean rather than a sharp bounce.
  motion: {
    loopPeriod: 2.8,
    breath: 0.032,
    bob: 3,
    wobble: 1.5,
    lean: 3.5,
    sag: -1.5,
    blinkEvery: 3.8,
  },
} satisfies MoodDef
