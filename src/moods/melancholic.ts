/**
 * Melancholic — half-lidded eyes sitting low, shifted bodily off centre and
 * tipped gently down at their outer ends. No tear.
 *
 * Sad is acute: steeply slanted, tearful, sagging hard. This is the long quiet
 * version — the eyes have simply drifted off to one side, settled down, and
 * lost the will to stay level. The sideways shift is the tell that separates it
 * from Cool, which sits dead centre and much wider.
 */

import type { MoodDef } from '../core/types'

export const melancholic = {
  id: 'melancholic',
  label: 'Melancholic',
  face: {
    left: { cx: 72, cy: 107, rx: 10.2, ry: 8.6, sq: 2.5, rot: -6 },
    right: { cx: 112, cy: 108, rx: 10.2, ry: 8.6, sq: 2.5, rot: -6 },
  },
  // Very slow and heavy, tilted, with the gaze resting downward throughout.
  motion: {
    loopPeriod: 6.8,
    breath: 0.014,
    bob: 1.1,
    wobble: 0.5,
    sag: 3,
    tilt: 2,
    gazeY: 2,
    gazeBias: 1.4,
    blinkEvery: 5.6,
    blinkDuration: 0.3,
  },
} satisfies MoodDef
