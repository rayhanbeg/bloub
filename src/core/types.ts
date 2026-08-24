/**
 * Core data model for bloub.
 *
 * TypeScript note: an `interface` describes the *shape* of an object — the
 * property names and the type of each value. It disappears at runtime; it only
 * exists to let the compiler check our code. A `type` alias does something
 * similar but can also describe unions, functions, etc.
 *
 * Design rule for this file: **every animatable property is a plain number.**
 * That is what makes smooth transitions possible — to animate from one mood to
 * another we just spring each number from its old value to its new one. No
 * special-casing, no "if the eye was a line and is now an oval" branches.
 */

import type { MoodMotion } from './idle'

/** A 2D point. */
export interface Point {
  x: number
  y: number
}

/**
 * A "curve element" — the primitive behind brows and arc-shaped (happy `^^`)
 * eyes.
 *
 * It describes a closed ribbon: a horizontal band of width `w * 2` and height
 * `thick`, arched by `bend` and optionally rippled by `wave`.
 *
 *   bend > 0  middle sits lower than the corners  → a `‿` (downcast, crying)
 *   bend < 0  middle sits higher than the corners → a `^` (happy squint)
 *   thick     0 = invisible hairline, 6 = a soft closed lid
 *   wave      adds an S-ripple along the band (dizzy, queasy eyes)
 */
export interface CurveSpec {
  /** 0–1. Cross-fades the element in and out so moods can add/remove parts. */
  op: number
  /** Offset from the element's anchor point (the eye centre). */
  dx: number
  dy: number
  /** Half-width. */
  w: number
  bend: number
  thick: number
  wave: number
  /** Degrees, rotated about its own centre. */
  rot: number
}

/**
 * A pupil / iris dot. Painted in the *blob's own colour* so it reads as a hole
 * punched out of the eye — that is what turns a plain oval into a ring eye
 * (surprised, scared) or a shifty side-eye (suspicious, sneaky).
 */
export interface PupilSpec {
  op: number
  dx: number
  dy: number
  r: number
}

/**
 * One eye. Two visual forms live here at once — a filled superellipse and a
 * curve (`arc`) — and moods pick between them with opacity. Because both forms
 * are always mounted and always animating, switching between a rounded-square
 * eye and a squinting `^` eye is a cross-fade of two moving shapes, not a cut.
 */
export interface EyeSpec {
  cx: number
  cy: number
  rx: number
  ry: number
  /**
   * Superellipse exponent: 2 = ellipse, ~3.5 = the rounded square this style
   * uses, higher = closer to a rectangle. Animating it lets an eye go from
   * blocky to round as part of a mood change.
   */
  sq: number
  rot: number
  op: number
  arc: CurveSpec
  brow: CurveSpec
  pupil: PupilSpec
}

/** A teardrop / sweat bead. Absolute coordinates in the 0–200 viewBox. */
export interface DropSpec {
  op: number
  x: number
  y: number
  r: number
}

/**
 * The complete face: two eyes and a few emotional garnishes.
 *
 * There is deliberately **no mouth**. Every mood is carried by eye shape, size,
 * position and angle alone, which is what keeps the whole set feeling like one
 * minimal character rather than a clip-art sheet of features. The garnishes
 * (blush, tear, sweat) only ever support what the eyes are already saying.
 */
export interface FaceSpec {
  left: EyeSpec
  right: EyeSpec
  /** Opacity of the two cheek blushes. */
  blush: number
  tear: DropSpec
  sweat: DropSpec
}

/**
 * TypeScript note: this is a *generic* type — `DeepPartial<T>` takes another
 * type `T` as a parameter, like a function takes an argument. It rebuilds `T`
 * with every property optional, all the way down. We use it so each mood file
 * only has to list the numbers it wants to *change* relative to the neutral
 * face, instead of restating all ~50 of them.
 *
 * `[K in keyof T]?:` is a mapped type: "for every key K of T, make it optional".
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/** A mood: an id, a human label, the face overrides, and how it moves. */
export interface MoodDef {
  id: string
  label: string
  face: DeepPartial<FaceSpec>
  /**
   * Idle-motion overrides. A mood is not just an expression — a sad blob should
   * breathe slowly and sag, an excited one should bounce. Omitted keys fall back
   * to the neutral baseline in {@link MoodMotion}.
   *
   * TypeScript note: this is a type-only circular import (`core/idle` imports
   * `DeepPartial` from here). That's fine — `import type` is erased at compile
   * time, so no real cycle exists at runtime.
   */
  motion?: Partial<MoodMotion>
}

/**
 * Where the face sits inside a silhouette. A triangle is narrow at the top and a
 * capsule is short, so each shape nudges and scales the face to fit rather than
 * forcing every shape to be circle-sized.
 */
export interface FacePlacement {
  dx: number
  dy: number
  scale: number
}

/** The identity placement — face exactly as authored. */
export const NEUTRAL_PLACEMENT: FacePlacement = { dx: 0, dy: 0, scale: 1 }

/**
 * A base blob silhouette. `path` returns an SVG path string drawn inside a
 * `0 0 200 200` viewBox.
 *
 * TypeScript note: `() => string` is a *function type* — "takes no arguments,
 * returns a string".
 */
export interface ShapeDef {
  id: string
  label: string
  path: () => string
  /** Optional face fit. Omitted means {@link NEUTRAL_PLACEMENT}. */
  face?: Partial<FacePlacement>
}

/** Everything needed to draw a blob. The single source of truth for the app. */
export interface BlobConfig {
  shape: string
  mood: string
  color: string
}
