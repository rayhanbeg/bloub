/**
 * The neutral face — the base every mood is expressed as a diff against — plus
 * the plumbing that turns a nested {@link FaceSpec} into the flat list of
 * numbers the animation layer springs between.
 *
 * The house style is deliberately *light*: large, soft, softly-rounded white
 * shapes with generous space between them. The eyes are the whole character —
 * there is no mouth anywhere in the system — so they're drawn big and cute,
 * sized in the 7–14 unit range against a 160-unit-wide body. Brows are available
 * in the model but stay at zero opacity by default; eye shape and angle carry
 * every emotion on their own.
 */

import type { DeepPartial, FacePlacement, FaceSpec } from './types'

/**
 * The point a face is scaled about when a shape asks for a smaller face.
 * Sits a little below the eyes so shrinking pulls them gently inward and down.
 */
export const FACE_ORIGIN = { x: 100, y: 104 } as const

/**
 * The SVG transform that applies a {@link FacePlacement}.
 *
 * This is the one transform in the whole face pipeline. It lives on a wrapper
 * group rather than on individual elements, so the "a path's `d` is the whole
 * truth" rule still holds for everything inside it.
 */
export function facePlacementTransform(p: FacePlacement): string {
  const parts: string[] = []
  if (p.dx !== 0 || p.dy !== 0) parts.push(`translate(${round(p.dx)} ${round(p.dy)})`)
  if (p.scale !== 1) {
    const { x, y } = FACE_ORIGIN
    parts.push(`translate(${x} ${y}) scale(${round(p.scale)}) translate(${-x} ${-y})`)
  }
  return parts.join(' ')
}

const round = (v: number): number => Math.round(v * 1000) / 1000

/** Cheek blush geometry (fixed; only opacity animates). `strength` caps how
 *  solid a blush can get, so moods can just say `blush: 1`. Kept low — a blush
 *  should be felt rather than seen. */
export const BLUSH = { dx: 46, y: 128, rx: 13.5, ry: 6.5, strength: 0.2 } as const

/**
 * The resting face: two big, soft, slightly-tall rounded capsules set wide
 * apart. No brows, no pupils, and — here and everywhere else — no mouth.
 *
 * The scale here is the single most important decision in the visual style. Each
 * eye is 20 units wide against a 160-unit body, and 35 tall, which is far larger
 * than "a face on a shape" instinctively wants to be. That is the point: small
 * features read as a logo, and features this size read as a creature. They also
 * sit a whisker below the body's centre line, which is the proportion that makes
 * anything look young.
 *
 * Every mood is a diff from these numbers, so this is also the one place to
 * adjust if the whole set ever needs to grow or shrink together.
 */
export const NEUTRAL_FACE: FaceSpec = {
  left: {
    cx: 77,
    cy: 100,
    rx: 10,
    ry: 17.6,
    sq: 2.6,
    rot: 0,
    op: 1,
    arc: { op: 0, dx: 0, dy: 0, w: 14, bend: -8.5, thick: 5.4, wave: 0, rot: 0 },
    brow: { op: 0, dx: 0, dy: -26, w: 13, bend: -4, thick: 4.2, wave: 0, rot: 0 },
    pupil: { op: 0, dx: 0, dy: 0, r: 4.8 },
  },
  right: {
    cx: 123,
    cy: 100,
    rx: 10,
    ry: 17.6,
    sq: 2.6,
    rot: 0,
    op: 1,
    arc: {
      op: 0,
      dx: 0,
      dy: 0,
      w: 14,
      bend: -8.5,
      thick: 5.4,
      wave: 0,
      rot: 0,
    },
    brow: {
      op: 0,
      dx: 0,
      dy: -26,
      w: 13,
      bend: -4,
      thick: 4.2,
      wave: 0,
      rot: 0,
    },
    pupil: { op: 0, dx: 0, dy: 0, r: 4.8 },
  },
  blush: 0,
  // Both garnishes have to survive every shape's face placement. The sweat bead
  // in particular sits well inside the top-right corner rather than out on the
  // temple, because the triangle pinches sharply there — at `{ dy: 20, scale:
  // 0.82 }` a bead further out lands *outside* the body, where a white drop on a
  // white page is simply invisible.
  tear: { op: 0, x: 64, y: 124, r: 6 },
  sweat: { op: 0, x: 142, y: 74, r: 6.2 },
}

/* --------------------------------------------------------------- utilities */

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Recursively overlay `over` onto `base`, returning a new object.
 *
 * TypeScript note: `<T>` before the parameter list declares a *type variable* —
 * whatever type you pass in as `base` is the type you get back. So
 * `deepMerge(NEUTRAL_FACE, ...)` is known to return a full `FaceSpec`, not a
 * vague object.
 */
function deepMerge<T>(base: T, over: DeepPartial<T> | undefined): T {
  if (!over) return base
  const out = { ...(base as object) } as Record<string, unknown>
  for (const [key, value] of Object.entries(over as object)) {
    if (value === undefined) continue
    const current = out[key]
    out[key] =
      isPlainObject(value) && isPlainObject(current)
        ? deepMerge(current, value as DeepPartial<typeof current>)
        : value
  }
  return out as T
}

/** Apply a mood's overrides to the neutral face, producing a complete face. */
export function resolveFace(override: DeepPartial<FaceSpec>): FaceSpec {
  return deepMerge(NEUTRAL_FACE, override)
}

/**
 * Flatten a face into `{ 'left.arc.bend': -8, ... }`.
 *
 * The animation layer holds one spring per entry here, so a mood change moves
 * every single property independently and continuously.
 */
export function flattenFace(face: FaceSpec): Record<string, number> {
  const out: Record<string, number> = {}
  const walk = (node: Record<string, unknown>, prefix: string): void => {
    for (const [key, value] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'number') out[path] = value
      else if (isPlainObject(value)) walk(value, path)
    }
  }
  walk(face as unknown as Record<string, unknown>, '')
  return out
}

/** Every animatable key, computed once from the neutral face. */
export const FACE_KEYS: readonly string[] = Object.keys(flattenFace(NEUTRAL_FACE))

/* ------------------------------------------------------- blink and gaze */

/**
 * The four blink formulas, kept here as one-liners so the live preview and the
 * exporters cannot drift apart. `b` is openness: 1 open, 0 shut.
 *
 * Each clamps to a small positive floor. A path with zero height is still a
 * valid path, but browsers and rasterisers disagree about how to render one, and
 * a hairline that reopens is indistinguishable from nothing at this size.
 */
export const blinkRy = (ry: number, b: number): number => Math.max(ry * b, 0.3)
export const blinkBend = (bend: number, b: number): number => bend * b
export const blinkThick = (thick: number, b: number): number =>
  Math.max(thick * (0.35 + 0.65 * b), 0.3)
export const blinkPupil = (r: number, b: number): number => Math.max(r * b, 0.15)

/**
 * A pupil's *vertical* offset has to shrink with the lid too.
 *
 * The animated-SVG exporter blinks by putting a CSS `scaleY` on a group that
 * contains the eye and its pupil, which squashes the offset for free. The
 * preview and the raster exporters rebuild each path from numbers instead, so
 * without this an off-centre pupil would keep its full offset while the eye
 * collapsed around it — a stray dot floating above a closed slit.
 */
export const blinkOffset = (dy: number, b: number): number => dy * b

/**
 * Apply one instant of idle animation — a blink amount and a gaze offset — to a
 * resting face, returning a new face.
 *
 * This is what makes an exported GIF frame identical to the frame the preview
 * would have drawn at the same phase: both start from the mood's resting face
 * and apply exactly these numbers.
 */
export function animateFace(base: FaceSpec, blink: number, gazeX: number, gazeY: number): FaceSpec {
  const eye = (e: FaceSpec['left']): FaceSpec['left'] => ({
    ...e,
    // Gaze moves the eye's own anchor, which carries the arc and pupil with it
    // because both are positioned relative to it.
    cx: e.cx + gazeX,
    cy: e.cy + gazeY,
    ry: blinkRy(e.ry, blink),
    arc: { ...e.arc, bend: blinkBend(e.arc.bend, blink), thick: blinkThick(e.arc.thick, blink) },
    pupil: { ...e.pupil, dy: blinkOffset(e.pupil.dy, blink), r: blinkPupil(e.pupil.r, blink) },
    // Brows are anchored to the head, not the eye, so half the gaze that the
    // shifted anchor just gave them is subtracted back off.
    brow: { ...e.brow, dx: e.brow.dx - gazeX * 0.5, dy: e.brow.dy - gazeY },
  })
  return { ...base, left: eye(base.left), right: eye(base.right) }
}
