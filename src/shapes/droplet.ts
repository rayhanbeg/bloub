/**
 * Droplet — a round top narrowing to a point at the bottom, per spec.
 *
 * Two details keep it from reading as a map pin: the body is chunky relative to
 * the tail (a pin has a small head on a long spike), and the point itself is
 * filleted rather than needle-sharp.
 *
 * The two sides are the *tangent lines* from the tip to the head circle, not
 * eyeballed curves — that's what removes any crease where the straight side
 * meets the round top.
 */

import { arcPath, arcStart, roundCoord } from './_helpers'
import { KAPPA } from '../core/geometry'

const CX = 100
const CY = 84
const R = 72
/** The point of the teardrop. Kept close to the head so the tail stays stubby —
 *  a long thin tail on a round head is a map pin, not a droplet. */
const TIP_Y = 174
/** How far back from the sharp tip the fillet starts. */
const TIP_ROUND = 19

export function dropletPath(): string {
  const d = TIP_Y - CY // centre of the head to the tip
  // Angle at the centre between "straight down" and each tangent point.
  const beta = Math.acos(R / d)
  const deg = (beta * 180) / Math.PI
  const sin = Math.sin(beta)
  const cos = Math.cos(beta)

  // Angles in SVG's y-down frame: 0 = east, 90 = south, 270 = north.
  const leftTangent = 90 + deg
  const rightTangent = 90 - deg

  // Walk back up each tangent line from the tip; the unit vector along the
  // right-hand tangent works out to exactly (cos β, −sin β).
  const edgeX = TIP_ROUND * cos
  const edgeY = TIP_Y - TIP_ROUND * sin
  const reach = TIP_ROUND * (1 - KAPPA * 1.3)
  const ctrlX = reach * cos
  const ctrlY = TIP_Y - reach * sin
  const r = roundCoord

  return (
    // From the left tangent point, sweep around the top to the right tangent
    // point, run down to the fillet, and curve across the tip.
    arcStart(CX, CY, R, leftTangent) +
    arcPath(CX, CY, R, leftTangent, rightTangent + 360) +
    `L${r(CX + edgeX)} ${r(edgeY)}` +
    `C${r(CX + ctrlX)} ${r(ctrlY)} ${r(CX - ctrlX)} ${r(ctrlY)} ${r(CX - edgeX)} ${r(edgeY)}` +
    'Z'
  )
}
