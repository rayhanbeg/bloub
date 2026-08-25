/**
 * Surprised — perfectly round ring eyes: a white circle with the body colour
 * punched out of the middle.
 *
 * `sq: 2` makes the superellipse a true circle and matching rx/ry keeps it
 * round rather than tall. The centred pupil is what makes it a *ring*, and a
 * ring is the most legible shock signal available without a mouth.
 */

import type { MoodDef } from '../core/types'
import { EYE } from '../core/face'

export const surprised = {
  id: 'surprised',
  label: 'Surprised',
  face: {
    left: { ...EYE.open, ry: 14.4, cy: 100 },
    right: { ...EYE.open, ry: 14.4, cy: 100 },
  },
  // Caught mid-breath: almost frozen, held slightly large, blinking rarely.
  motion: {
    loopPeriod: 3,
    breath: 0.012,
    bob: 0.9,
    wobble: 0.5,
    scale: 1.02,
    blinkEvery: 5.4,
    blinkJitter: 2,
  },
} satisfies MoodDef
