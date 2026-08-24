/**
 * Triangle — a rounded, bowed triangle pointing up.
 *
 * Three deliberate departures from a geometric triangle: the corner fillets are
 * large, `softness` above circular bows each corner outward, and it's drawn
 * larger than the other shapes. A triangle in the same bounding box as a circle
 * has barely half the area, so matching bounds would make it look shrunken next
 * to its neighbours — it has to overshoot to read as the same size.
 */

import { roundedPolygonPath } from './_helpers'
import type { Point } from '../core/types'

const VERTICES: Point[] = [
  { x: 100, y: 21 }, // apex
  { x: 187, y: 177 }, // bottom right
  { x: 13, y: 177 }, // bottom left
]

export function trianglePath(): string {
  return roundedPolygonPath(VERTICES, 62, 0.9)
}
