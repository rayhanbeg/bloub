/**
 * Thinking — both eyes narrowed and shifted up and off to one side.
 *
 * Moving *both* eyes by the same amount is what makes this read as a glance
 * rather than as a misaligned face. Narrowing them is what separates working on
 * a problem from Daydreaming, which drifts off with its eyes wide open.
 */

import type { MoodDef } from '../core/types'

export const thinking = {
  id: 'thinking',
  label: 'Thinking',
  face: {
    left: { cx: 84, cy: 96, rx: 8.8, ry: 13.2, sq: 2.7 },
    right: { cx: 130, cy: 96, rx: 8.8, ry: 13.2, sq: 2.7 },
  },
  // A slow lean with the gaze drifting further up and away.
  motion: {
    loopPeriod: 5.2,
    breath: 0.018,
    bob: 1.4,
    wobble: 0.6,
    lean: 3.5,
    tilt: 3,
    gazeX: 2.4,
    gazeXHarmonic: 1,
    gazeY: -1.8,
    blinkEvery: 4,
  },
} satisfies MoodDef
