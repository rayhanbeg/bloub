/**
 * Amazed — the tallest eyes in the set, with brows lifted clear above them.
 *
 * Three moods here open their eyes wide, and each does it differently:
 * Surprised goes round with a ring, Star-struck adds a gleam and a blush, and
 * Amazed goes *tall* and raises its brows. Awe, looking up at something big.
 */

import type { MoodDef } from '../core/types'

export const amazed = {
  id: 'amazed',
  label: 'Amazed',
  face: {
    left: {
      rx: 12,
      ry: 20.4,
      sq: 2.2,
      cy: 101,
      brow: { op: 1, dy: -30, w: 12.5, bend: -6.5, thick: 4.4 },
    },
    right: {
      rx: 12,
      ry: 20.4,
      sq: 2.2,
      cy: 101,
      brow: { op: 1, dy: -30, w: 12.5, bend: -6.5, thick: 4.4 },
    },
  },
  // Held still and lifted, with the gaze drifting slowly upward.
  motion: {
    loopPeriod: 3.6,
    breath: 0.02,
    bob: 1.4,
    wobble: 0.8,
    sag: -2.5,
    gazeY: -1.6,
    blinkEvery: 5.6,
  },
} satisfies MoodDef
