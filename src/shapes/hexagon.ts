/**
 * Hexagon — rounded corners, flat top and bottom.
 *
 * Flat-top orientation (points at the left and right) rather than pointy-top:
 * it puts the shape's full width at eye height, so the face sits comfortably.
 */

import { polygonVertices, roundedPolygonPath } from './_helpers'

export function hexagonPath(): string {
  return roundedPolygonPath(polygonVertices(100, 100, 86, 6, 0), 30, 0.7)
}
