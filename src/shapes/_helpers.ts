/**
 * Shape-construction helpers.
 *
 * The eight silhouettes are built from four techniques, all of which emit a
 * single closed path made only of `M`/`L`/`C`/`Z`. Keeping to one subpath with
 * no arcs matters for two reasons: `flubber` can resample it cleanly when
 * morphing, and design tools open the exported SVG without surprises.
 */

import { KAPPA } from '../core/geometry'
import type { Point } from '../core/types'

const r2 = (v: number): string => {
  const n = Math.round(v * 100) / 100
  return Object.is(n, -0) ? '0' : String(n)
}

const pt = (p: Point): string => `${r2(p.x)} ${r2(p.y)}`

/* ------------------------------------------------------- rounded rectangle */

/** Corner radii, clockwise from the top-left. */
export interface Corners {
  tl: number
  tr: number
  br: number
  bl: number
}

/**
 * Rounded rectangle with independent corner radii. Corners are cubic béziers
 * pulled toward the sharp vertex by `KAPPA`, which is what makes them read as
 * circular rather than as a lazy quadratic bulge.
 */
export function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  corners: Corners,
): string {
  // Never let opposing radii overlap along an edge.
  const fit = (a: number, b: number, span: number): [number, number] => {
    const total = a + b
    return total <= span ? [a, b] : [(a / total) * span, (b / total) * span]
  }
  const [tl0, tr0] = fit(corners.tl, corners.tr, w)
  const [bl0, br0] = fit(corners.bl, corners.br, w)
  const [tlv, blv] = fit(tl0, bl0, h)
  const [trv, brv] = fit(tr0, br0, h)
  const tl = Math.min(tl0, tlv)
  const tr = Math.min(tr0, trv)
  const br = Math.min(br0, brv)
  const bl = Math.min(bl0, blv)

  const r = x + w
  const b = y + h
  const k = KAPPA

  return [
    `M${r2(x + tl)} ${r2(y)}`,
    `L${r2(r - tr)} ${r2(y)}`,
    `C${r2(r - tr + tr * k)} ${r2(y)} ${r2(r)} ${r2(y + tr - tr * k)} ${r2(r)} ${r2(y + tr)}`,
    `L${r2(r)} ${r2(b - br)}`,
    `C${r2(r)} ${r2(b - br + br * k)} ${r2(r - br + br * k)} ${r2(b)} ${r2(r - br)} ${r2(b)}`,
    `L${r2(x + bl)} ${r2(b)}`,
    `C${r2(x + bl - bl * k)} ${r2(b)} ${r2(x)} ${r2(b - bl + bl * k)} ${r2(x)} ${r2(b - bl)}`,
    `L${r2(x)} ${r2(y + tl)}`,
    `C${r2(x)} ${r2(y + tl - tl * k)} ${r2(x + tl - tl * k)} ${r2(y)} ${r2(x + tl)} ${r2(y)}`,
    'Z',
  ].join('')
}

/* ---------------------------------------------------------- rounded polygon */

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y })
const len = (p: Point): number => Math.hypot(p.x, p.y)
const scaleTo = (p: Point, d: number): Point => {
  const l = len(p) || 1
  return { x: (p.x / l) * d, y: (p.y / l) * d }
}
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y })

/**
 * Polygon with filleted corners. Each vertex is trimmed back along both of its
 * edges by `radius`, and the gap bridged with a cubic whose handles reach toward
 * the original sharp point.
 *
 * `softness` above 0.55 (roughly circular) bows the corner outward for a
 * squashier, more organic feel — which is what the triangle wants so it reads as
 * a friendly blob rather than a road sign.
 */
export function roundedPolygonPath(
  vertices: Point[],
  radius: number,
  softness = KAPPA,
): string {
  const n = vertices.length
  const parts: string[] = []

  for (let i = 0; i < n; i++) {
    const prev = vertices[(i - 1 + n) % n]
    const curr = vertices[i]
    const next = vertices[(i + 1) % n]

    // Clamp the fillet so it can never eat more than half of either edge.
    const rIn = Math.min(radius, len(sub(curr, prev)) / 2)
    const rOut = Math.min(radius, len(sub(curr, next)) / 2)

    const entry = add(curr, scaleTo(sub(prev, curr), rIn))
    const exit = add(curr, scaleTo(sub(next, curr), rOut))

    parts.push(i === 0 ? `M${pt(entry)}` : `L${pt(entry)}`)
    const c1 = add(entry, scaleTo(sub(curr, entry), rIn * softness))
    const c2 = add(exit, scaleTo(sub(curr, exit), rOut * softness))
    parts.push(`C${pt(c1)} ${pt(c2)} ${pt(exit)}`)
  }

  parts.push('Z')
  return parts.join('')
}

/** Vertices of a regular polygon. `rotation` is in degrees, 0 = first point right. */
export function polygonVertices(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation = 0,
): Point[] {
  const out: Point[] = []
  for (let i = 0; i < sides; i++) {
    const a = ((rotation + (360 / sides) * i) * Math.PI) / 180
    out.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) })
  }
  return out
}

/* -------------------------------------------------------------- superellipse */

/**
 * Superellipse (Lamé curve): |x/a|^n + |y/b|^n = 1.
 *
 * n = 2 is an ellipse; n around 4–5 is the "squircle" that reads as a rounded
 * square without the visible seam where a rounded rectangle's straight edge
 * meets its corner arc.
 */
export function superellipsePoints(
  cx: number,
  cy: number,
  a: number,
  b: number,
  n: number,
  samples: number,
): Point[] {
  const e = 2 / n
  const out: Point[] = []
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    out.push({
      x: cx + a * Math.sign(c) * Math.abs(c) ** e,
      y: cy + b * Math.sign(s) * Math.abs(s) ** e,
    })
  }
  return out
}

/* ------------------------------------------------------------- circle union */

export interface Lobe {
  cx: number
  cy: number
  r: number
}

/**
 * Outline of a union of overlapping circles, found by casting a ray from
 * `(ox, oy)` at each sampled angle and keeping the farthest surface it hits.
 *
 * This is how the cloud gets its bumps: place a handful of circles, and the
 * outline follows whichever lobe is outermost at each angle. Valid as long as
 * the union is star-shaped about the origin point, which a cloud arrangement is.
 */
export function circleUnionPoints(
  lobes: Lobe[],
  samples: number,
  ox = 0,
  oy = 0,
): Point[] {
  const out: Point[] = []
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    let best = 0
    for (const lobe of lobes) {
      const cx = lobe.cx - ox
      const cy = lobe.cy - oy
      const proj = dx * cx + dy * cy
      const disc = proj * proj - (cx * cx + cy * cy) + lobe.r * lobe.r
      if (disc < 0) continue
      const t = proj + Math.sqrt(disc)
      if (t > best) best = t
    }
    out.push({ x: ox + dx * best, y: oy + dy * best })
  }
  return out
}

/* --------------------------------------------------------------- arc + point */

/**
 * A circular arc as cubic béziers, split so no segment exceeds 90°.
 * Angles in degrees, measured clockwise from "east" (SVG's y-down convention).
 */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = (startDeg * Math.PI) / 180
  const end = (endDeg * Math.PI) / 180
  const sweep = end - start
  const steps = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2)))
  const step = sweep / steps
  // Exact bézier handle length for an arc of this angular width.
  const k = (4 / 3) * Math.tan(step / 4)

  const at = (a: number): Point => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  let out = ''
  for (let i = 0; i < steps; i++) {
    const a0 = start + step * i
    const a1 = a0 + step
    const p0 = at(a0)
    const p1 = at(a1)
    const c1 = { x: p0.x - k * r * Math.sin(a0), y: p0.y + k * r * Math.cos(a0) }
    const c2 = { x: p1.x + k * r * Math.sin(a1), y: p1.y - k * r * Math.cos(a1) }
    out += `C${pt(c1)} ${pt(c2)} ${pt(p1)}`
  }
  return out
}

/** Move-to for the start of {@link arcPath}. */
export function arcStart(cx: number, cy: number, r: number, startDeg: number): string {
  const a = (startDeg * Math.PI) / 180
  return `M${r2(cx + r * Math.cos(a))} ${r2(cy + r * Math.sin(a))}`
}

export { r2 as roundCoord }
