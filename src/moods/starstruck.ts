/**
 * Star-struck — big soft eyes with a small pupil high and toward the nose, over
 * the strongest blush of any wide-eyed mood: gazing up at someone adoringly.
 *
 * A large hole was the obvious first idea here and it was wrong — it ate the eye
 * and left a thin ring that read as shock, not admiration. What actually sells
 * adoration is *how much white is left*: a small pupil pushed up and inward
 * leaves a broad bright field under and around it, which is the look of someone
 * staring up at a hero. Surprised keeps its hole big and dead centre; Scared
 * keeps its small pupil high but adds cold sweat and much narrower eyes.
 */

import type { MoodDef } from '../core/types'
import { EYE } from '../core/face'

export const starstruck = {
  id: 'starstruck',
  label: 'Star-struck',
  face: {
    left: {
      ...EYE.open,
      ry: 14.2,
      cy: 98,
    },
    right: {
      ...EYE.open,
      ry: 14.2,
      cy: 98,
    },
    blush: 0.95,
  },
  // Bouncing on the spot and swaying — starry rather than merely surprised.
  motion: {
    loopPeriod: 2.4,
    breath: 0.034,
    bob: 3.2,
    wobble: 1.4,
    lean: 3,
    hop: 4,
    blinkEvery: 4.6,
  },
} satisfies MoodDef
