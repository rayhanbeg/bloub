/**
 * Happy — the canonical `^ ^`: both eyes closed into soft upward arcs, with a
 * light blush.
 *
 * This is the middle of the closed-arc family on purpose. It sets the reference
 * every other happy mood is measured against — Laughing squeezes harder and
 * narrower, Blissful spreads wider and heavier, Proud sits higher and thinner,
 * Grateful bows inward, Love-struck tips outward. Happy is just *happy*.
 */

import type { MoodDef } from '../core/types'
import { EYE } from '../core/face'

export const happy = {
  id: 'happy',
  label: 'Happy',
  face: {
    left: { ...EYE.closed, cy: 99 },
    right: { ...EYE.closed, cy: 99 },
    blush: 0.5,
  },
  // Light and quick without tipping into frantic.
  motion: {
    loopPeriod: 3.2,
    breath: 0.026,
    bob: 2.6,
    wobble: 1.4,
    blinkEvery: 3.4,
  },
} satisfies MoodDef
