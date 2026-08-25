/**
 * Attentive — slim, tall eyes under a thin pair of lifted brows: perked up and
 * listening.
 *
 * Proportion alone couldn't carry this. Eyes a little taller than Neutral's is
 * the kind of difference that vanishes at thumbnail size, so Attentive takes the
 * brows — the one cue that unambiguously means *alert* — and keeps them thin and
 * low over the eye. Amazed uses brows too, but sits them far higher over much
 * bigger eyes: a lift of interest versus a lift of awe.
 */

import type { MoodDef } from '../core/types'
import { EYE, eyeBrow } from '../core/face'

export const attentive = {
  id: 'attentive',
  label: 'Attentive',
  face: {
    left: {
      ...EYE.open,
      cy: 99,
      ...eyeBrow(-3, -24),
    },
    right: {
      ...EYE.open,
      cy: 99,
      ...eyeBrow(-3, -24),
    },
  },
  // A shade quicker than Neutral, blinking a little more often — engaged.
  motion: { loopPeriod: 3.8, bob: 1.9, wobble: 1.1, blinkEvery: 3.6 },
} satisfies MoodDef
