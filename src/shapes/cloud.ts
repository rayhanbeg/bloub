/**
 * Cloud — five overlapping circles, outlined as their union.
 *
 * Bigger lobes across the top, a wide flat-ish lobe holding the base. The
 * outline is traced by ray-casting from a point low in the shape so the sampled
 * angles spread evenly across the bumps rather than bunching up top.
 */

import { closedSmoothPath } from '../core/geometry'
import { circleUnionPoints } from './_helpers'
import type { Lobe } from './_helpers'

const LOBES: Lobe[] = [
  { cx: 100, cy: 114, r: 60 }, // base
  { cx: 50, cy: 104, r: 42 }, // left
  { cx: 150, cy: 104, r: 42 }, // right
  { cx: 74, cy: 68, r: 44 }, // upper left bump
  { cx: 128, cy: 66, r: 46 }, // upper right bump (largest, off-centre)
]

export function cloudPath(): string {
  return closedSmoothPath(circleUnionPoints(LOBES, 84, 100, 104))
}
