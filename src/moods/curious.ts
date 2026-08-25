/**
 * Curious — lifted eyes, one standing noticeably taller than the other.
 *
 * The height mismatch is the whole expression. Two matched wide eyes read as
 * surprise; one stretching further than the other reads as *interest*, because
 * it looks like the face is still adjusting to what it's seeing.
 */

import type { MoodDef } from '../core/types'
import { EYE } from '../core/face'

export const curious = {
  id: 'curious',
  label: 'Curious',
  face: {
    left: { ...EYE.open, cy: 97, ry: 16.2 },
    right: { ...EYE.softOpen, cy: 101 },
  },
  // Leans in and peers, gaze sweeping slowly across — looking *at* something.
  motion: {
    loopPeriod: 4.6,
    bob: 1.6,
    wobble: 1.3,
    lean: 4,
    tilt: 2.5,
    gazeX: 2.4,
    gazeXHarmonic: 1,
    blinkEvery: 3.4,
  },
} satisfies MoodDef
