/**
 * Suspicious — narrowed eyes at mismatched angles with both pupils dragged to
 * the outside: a side-eye.
 *
 * The pupils are what make it. Sneaky *glances* sideways by moving the whole
 * eye; here the eyes stay put and only the pupils slide, which is exactly the
 * difference between looking at something and not trusting it.
 *
 * The lids have to keep enough height for the pupil to sit *inside* them. Drop
 * below about `ry: 7` with a pupil this size and the hole reaches the edge, which
 * stops reading as a pupil and starts reading as a bite taken out of the eye.
 */

import type { MoodDef } from '../core/types'

export const suspicious = {
  id: 'suspicious',
  label: 'Suspicious',
  face: {
    left: {
      rx: 10.6,
      ry: 7.8,
      sq: 2.9,
      cy: 100,
      rot: 6,
      pupil: { op: 1, dx: -3.8, dy: 0, r: 3 },
    },
    right: {
      rx: 10.6,
      ry: 7,
      sq: 3,
      cy: 101,
      rot: 2,
      pupil: { op: 1, dx: -3.8, dy: 0, r: 3 },
    },
  },
  // Still and watchful, with one slow sweep per loop.
  motion: {
    loopPeriod: 5,
    breath: 0.016,
    bob: 1.2,
    wobble: 0.5,
    gazeX: 2.2,
    gazeXHarmonic: 1,
    blinkEvery: 4.6,
  },
} satisfies MoodDef
