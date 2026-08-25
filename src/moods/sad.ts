/**
 * Sad — flattened eyes with their *inner* ends lifted steeply, sitting low, and
 * one big tear.
 *
 * Inner corners raised is the universal read for sadness, and it is the exact
 * mirror of Angry. That pair of opposite rotations is the cheapest, clearest
 * emotional signal there is — but only if the eye is wide enough relative to its
 * height for a tilt to be *visible*, which is why these are flattened ovals
 * rather than the near-circles they started as. They stay soft (`sq: 2.4`) where
 * Angry's are hard-edged dashes.
 */

import type { MoodDef } from '../core/types'

export const sad = {
  id: 'sad',
  label: 'Sad',
  face: {
    left: { rx: 11, ry: 6.8, sq: 2.4, cy: 104, rot: -20 },
    right: { rx: 11, ry: 6.8, sq: 2.4, cy: 104, rot: 20 },
    tear: { op: 1, x: 67, y: 121, r: 6.6 },
  },
  // Slow heavy breathing, body sagging, gaze drifting down and slowly back.
  motion: {
    loopPeriod: 6.4,
    breath: 0.014,
    bob: 1.1,
    wobble: 0.55,
    sag: 3.5,
    gazeY: 2.6,
    gazeBias: 1,
    blinkEvery: 5.5,
    blinkDuration: 0.24,
  },
} satisfies MoodDef
