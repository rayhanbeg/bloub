/**
 * Sleepy — short, narrow slits sitting lower than any other mood's, one lid
 * hanging a shade further than the other.
 *
 * They stay as thin *shapes* rather than closed arcs on purpose: the drowsy slow
 * blink is the whole point here, and a lid can only visibly fall if there is
 * something still open to close. The mismatch between the two is what keeps it
 * clear of Unimpressed's matched deadpan — one eye losing the fight first is
 * exactly how falling asleep looks.
 */

import type { MoodDef } from '../core/types'

export const sleepy = {
  id: 'sleepy',
  label: 'Sleepy',
  face: {
    left: { rx: 8.4, ry: 3.6, sq: 3.4, cy: 108 },
    right: { rx: 8.4, ry: 2.6, sq: 3.4, cy: 108 },
  },
  // The slowest breath in the set, a held head-tilt, and a blink that takes well
  // over a second to close and reopen — all the way shut.
  motion: {
    loopPeriod: 7.5,
    breath: 0.028,
    bob: 2.2,
    wobble: 0.45,
    sag: 2.5,
    tilt: 4,
    blinkEvery: 3.2,
    blinkJitter: 0.7,
    blinkDuration: 1.3,
    blinkDepth: 1,
  },
} satisfies MoodDef
