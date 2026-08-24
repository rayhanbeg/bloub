/**
 * Capsule — a horizontal pill. Radius is exactly half the height, so the ends
 * are true semicircles.
 */

import { roundedRectPath } from './_helpers'

const WIDTH = 172
const HEIGHT = 122

export function capsulePath(): string {
  const r = HEIGHT / 2
  return roundedRectPath(100 - WIDTH / 2, 100 - HEIGHT / 2, WIDTH, HEIGHT, {
    tl: r,
    tr: r,
    br: r,
    bl: r,
  })
}
