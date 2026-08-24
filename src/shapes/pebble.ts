/**
 * Pebble — an asymmetric rounded rectangle. Heavily rounded on the top-left and
 * bottom-right, tighter on the other two corners, which gives it the tumbled,
 * water-worn look of a real pebble without resorting to random noise.
 */

import { roundedRectPath } from './_helpers'

export function pebblePath(): string {
  return roundedRectPath(22, 27, 156, 146, { tl: 72, tr: 46, br: 74, bl: 40 })
}
