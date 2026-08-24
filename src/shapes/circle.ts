/**
 * Circle — a true circle, drawn with four cubic béziers rather than an `<arc>`
 * so that every shape in the app is made of the same kind of segment. That
 * keeps morphing predictable and keeps the exported SVG friendly to design
 * tools.
 *
 * All shapes are drawn inside a `0 0 200 200` viewBox and are sized to occupy
 * roughly the same visual area, so switching shape doesn't change how big the
 * blob feels.
 */

const CX = 100
const CY = 100
const R = 80
/** Magic constant for approximating a quarter circle with a cubic bézier. */
const K = 0.5522847498 * R

export function circlePath(): string {
  return [
    `M${CX} ${CY - R}`,
    `C${CX + K} ${CY - R} ${CX + R} ${CY - K} ${CX + R} ${CY}`,
    `C${CX + R} ${CY + K} ${CX + K} ${CY + R} ${CX} ${CY + R}`,
    `C${CX - K} ${CY + R} ${CX - R} ${CY + K} ${CX - R} ${CY}`,
    `C${CX - R} ${CY - K} ${CX - K} ${CY - R} ${CX} ${CY - R}`,
    'Z',
  ].join('')
}
