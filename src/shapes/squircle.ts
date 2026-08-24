/**
 * Squircle — a superellipse rather than a rounded rectangle.
 *
 * The difference is visible: a rounded rectangle has a curvature discontinuity
 * where its straight edge meets the corner arc, which the eye reads as a faint
 * crease. A superellipse's curvature varies continuously, so the corner flows
 * into the edge. It's the same reason Apple moved to this curve for app icons.
 */

import { closedSmoothPath } from '../core/geometry'
import { superellipsePoints } from './_helpers'

/** 4.4 lands between "rounded square" and "circle" — square enough to read. */
const EXPONENT = 4.4
const SAMPLES = 44

export function squirclePath(): string {
  return closedSmoothPath(superellipsePoints(100, 100, 80, 80, EXPONENT, SAMPLES))
}
