/**
 * Pure geometry helpers. No React, no DOM — safe to use inside animation
 * frames, in static previews, and in the export pipeline.
 *
 * Everything here returns *absolute* coordinates in the 0–200 viewBox with any
 * rotation already applied to the points. That means face elements never need
 * an SVG `transform` attribute: a path's `d` is the whole truth. It keeps the
 * animated preview and the exported file in exact agreement, and sidesteps the
 * usual transform-origin headaches with animated SVG.
 */

import type { CurveSpec, Point } from './types'

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v

/** Trim float noise so path strings stay short (matters for SVG/GIF exports). */
const r2 = (v: number): string => {
  const n = Math.round(v * 100) / 100
  return Object.is(n, -0) ? '0' : String(n)
}

/** Rotate `p` about `origin` by `deg`. */
function rotatePoint(p: Point, origin: Point, deg: number): Point {
  if (!deg) return p
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = p.x - origin.x
  const dy = p.y - origin.y
  return { x: origin.x + dx * cos - dy * sin, y: origin.y + dx * sin + dy * cos }
}

/**
 * Convert a list of points into a smooth *closed* path using a Catmull-Rom
 * spline expressed as cubic béziers. Catmull-Rom passes exactly through every
 * point, so the maths that positions the points stays readable and the spline
 * just rounds the result off.
 */
export function closedSmoothPath(points: Point[], tension = 1): string {
  const len = points.length
  if (len < 3) return ''
  const at = (i: number): Point => points[(i + len) % len]

  let d = `M${r2(points[0].x)} ${r2(points[0].y)}`
  for (let i = 0; i < len; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2.x)} ${r2(p2.y)}`
  }
  return `${d}Z`
}

/**
 * TypeScript note: `Omit<T, 'a' | 'b'>` is `T` with those keys removed, and `&`
 * intersects two object types together. So this says: "a CurveSpec without its
 * opacity/offset bookkeeping, plus an absolute centre" — the exact inputs the
 * path maths needs, and it stays in sync if CurveSpec changes.
 */
export type CurveGeom = Omit<CurveSpec, 'op' | 'dx' | 'dy'> & {
  cx: number
  cy: number
}

/**
 * Build the path for a curve element — the single primitive behind brows and
 * arc-shaped (`^^`) eyes.
 *
 * The band is sampled across its width to get an upper and a lower edge; the
 * two edges are joined into one closed loop and smoothed. Because the result is
 * a *filled* shape rather than a stroke, `thick` can animate all the way from a
 * hairline to a soft closed lid without ever changing technique.
 */
export function curvePath(g: CurveGeom, samples = 8): string {
  const w = Math.max(g.w, 0.01)
  const half = Math.max(g.thick, 0.02) / 2
  const origin: Point = { x: g.cx, y: g.cy }
  const upper: Point[] = []
  const lower: Point[] = []

  for (let i = 0; i <= samples; i++) {
    const u = -1 + (2 * i) / samples // normalised position across the band, -1 → 1
    // Parabolic arch: full `bend` at the centre, zero at the corners.
    const arch = g.bend * (1 - u * u)
    const ripple = g.wave === 0 ? 0 : g.wave * Math.sin(u * Math.PI)
    const x = g.cx + u * w
    const y = g.cy + arch + ripple
    upper.push(rotatePoint({ x, y: y - half }, origin, g.rot))
    lower.push(rotatePoint({ x, y: y + half }, origin, g.rot))
  }

  return closedSmoothPath([...upper, ...lower.reverse()])
}

/** Magic constant for approximating a quarter ellipse with a cubic bézier. */
export const KAPPA = 0.5522847498

export interface EllipseGeom {
  cx: number
  cy: number
  rx: number
  ry: number
  rot?: number
}

/**
 * An ellipse as four cubic béziers, with rotation baked into the points.
 * Used for pupils, blushes and tears.
 */
export function ellipsePath(g: EllipseGeom): string {
  const rx = Math.max(g.rx, 0.01)
  const ry = Math.max(g.ry, 0.01)
  const kx = rx * KAPPA
  const ky = ry * KAPPA
  const o: Point = { x: g.cx, y: g.cy }
  const rot = g.rot ?? 0
  const p = (x: number, y: number): Point => rotatePoint({ x: o.x + x, y: o.y + y }, o, rot)

  const top = p(0, -ry)
  const right = p(rx, 0)
  const bottom = p(0, ry)
  const left = p(-rx, 0)
  const seg = (c1: Point, c2: Point, end: Point): string =>
    `C${r2(c1.x)} ${r2(c1.y)} ${r2(c2.x)} ${r2(c2.y)} ${r2(end.x)} ${r2(end.y)}`

  return (
    `M${r2(top.x)} ${r2(top.y)}` +
    seg(p(kx, -ry), p(rx, -ky), right) +
    seg(p(rx, ky), p(kx, ry), bottom) +
    seg(p(-kx, ry), p(-rx, ky), left) +
    seg(p(-rx, -ky), p(-kx, -ry), top) +
    'Z'
  )
}

export interface SuperellipseGeom extends EllipseGeom {
  /**
   * Superellipse exponent. 2 is a plain ellipse, ~3.5 is the rounded square the
   * eyes use, and higher values approach a hard rectangle.
   */
  n: number
}

/** Enough samples for a crisp corner; Catmull-Rom smooths the rest. */
const SUPERELLIPSE_SAMPLES = 20

/**
 * A superellipse as a smooth closed path, rotation baked in.
 *
 * This is the eye primitive. The blocky rounded-square eye is most of the
 * character in this style, and because the exponent `n` is just another number,
 * an eye can animate from rounded-square to perfect circle to flat dash without
 * ever changing technique.
 */
export function superellipsePath(g: SuperellipseGeom): string {
  const rx = Math.max(g.rx, 0.01)
  const ry = Math.max(g.ry, 0.01)
  const e = 2 / Math.max(g.n, 0.4)
  const origin: Point = { x: g.cx, y: g.cy }
  const rot = g.rot ?? 0
  const points: Point[] = []

  for (let i = 0; i < SUPERELLIPSE_SAMPLES; i++) {
    const t = (i / SUPERELLIPSE_SAMPLES) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    points.push(
      rotatePoint(
        {
          x: g.cx + rx * Math.sign(c) * Math.abs(c) ** e,
          y: g.cy + ry * Math.sign(s) * Math.abs(s) ** e,
        },
        origin,
        rot,
      ),
    )
  }
  return closedSmoothPath(points)
}

/* ------------------------------------------------------------------ colour */

/** `#rgb` / `#rrggbb` → `[r, g, b]` in 0–255. Falls back to black. */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  if (!/^[0-9a-f]{6}$/i.test(h)) return [0, 0, 0]
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** WCAG relative luminance, 0 (black) → 1 (white). */
export function luminance(hex: string): number {
  const toLinear = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * `[r, g, b]` in 0–255 → `[h, s, l]`, hue in degrees and the rest in 0–1.
 *
 * TypeScript note: `[number, number, number]` is a *tuple* — an array whose
 * length and per-slot types are both fixed. It's what lets `const [h, s] = ...`
 * below know that `h` and `s` are numbers rather than `number | undefined`.
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l] // grey: hue is meaningless
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === rn
      ? ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
      : max === gn
        ? ((bn - rn) / d + 2) * 60
        : ((rn - gn) / d + 4) * 60
  return [h, s, l]
}

/** `[h, s, l]` → `#rrggbb`. */
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = ((((h % 360) + 360) % 360) / 60) % 6
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const rgb: [number, number, number] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x]
  const m = l - c / 2
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(Math.min(Math.max(v + m, 0), 1) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

/** How the eyes are tinted on a body too light to carry white ones. */
const INK_LIGHTNESS = 0.31
const INK_MIN_SATURATION = 0.52
/** Eyes for a light body with no hue of its own — white, bone, grey. A muted
 *  indigo rather than a grey, so it still reads as ink and never as black. */
const NEUTRAL_INK = '#4f4b63'

/**
 * Pick the eye colour for a given blob colour. Single place the app decides
 * contrast, so the face is always legible.
 *
 * **The eyes are never black.** Dark bodies get plain white; light ones (amber,
 * lime, bone) get a deep, saturated tint of *their own hue* — amber eyes on an
 * amber blob, olive on lime. Black features on a coloured body look like a
 * sticker stuck on top of it, where a tint of the body's own hue reads as the
 * same creature in shadow, which is both softer and much cuter.
 *
 * The 0.46 threshold is tuned so mid-bright warm hues like amber land on the
 * tinted side — white on amber is technically readable but looks washed out.
 */
export function featureColor(blobColor: string): string {
  if (luminance(blobColor) <= 0.46) return '#ffffff'
  const [h, s] = rgbToHsl(...hexToRgb(blobColor))
  // A near-grey body has no hue worth deepening; tinting it would invent one.
  if (s < 0.08) return NEUTRAL_INK
  return hslToHex(h, Math.max(s, INK_MIN_SATURATION), INK_LIGHTNESS)
}
