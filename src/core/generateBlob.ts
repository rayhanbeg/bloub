/**
 * generateBlob — the portable core of bloub.
 *
 * Pure functions that turn `(shape, mood, colour)` into SVG markup. No React,
 * no DOM, no side effects. This is what the picker cards render, what the export
 * system serialises, and what a future standalone package would expose.
 */

import { featureColor, superellipsePath } from './geometry'
import { facePlacementTransform } from './face'
import type { BlobConfig, EyeSpec, FacePlacement, FaceSpec } from './types'
import { moodFace } from '../moods'
import { shapeFacePlacement, shapePath } from '../shapes'

export const VIEWBOX = 200

/** Which of the two colours a primitive is painted with. */
export type PaintRole = 'features' | 'body'

/**
 * A single drawable piece of the face. Every face element reduces to this: a
 * path, a colour role, and an opacity. Nothing else.
 */
export interface Primitive {
  key: string
  d: string
  paint: PaintRole
  op: number
}

const eyePrimitives = (eye: EyeSpec, side: string): Primitive[] => [
  {
    key: `${side}.eye`,
    d: superellipsePath({
      cx: eye.cx,
      cy: eye.cy,
      rx: eye.rx,
      ry: eye.ry,
      rot: eye.rot,
      n: eye.sq,
    }),
    paint: 'features',
    op: eye.op,
  },
]

/**
 * Flatten a resolved face into an ordered list of primitives. This is the one
 * definition of "what a face is made of" — the live preview animates these same
 * pieces, and the exporters serialise them.
 *
 * The canonical face consists exclusively of the two eye primitives.
 */
export function facePrimitives(face: FaceSpec): Primitive[] {
  return [
    ...eyePrimitives(face.left, 'left'),
    ...eyePrimitives(face.right, 'right'),
  ]
}

const n = (v: number): string => String(Math.round(v * 1000) / 1000)

/** Serialise primitives to `<path>` markup, dropping anything invisible. */
export function primitivesToMarkup(
  primitives: Primitive[],
  colors: Record<PaintRole, string>,
): string {
  return primitives
    .filter((p) => p.op > 0.002)
    .map((p) => {
      const op = p.op < 0.998 ? ` opacity="${n(p.op)}"` : ''
      return `<path d="${p.d}" fill="${colors[p.paint]}"${op}/>`
    })
    .join('')
}

export interface GenerateOptions {
  /** Rendered width/height. Numbers are px; `'100%'` makes it fill its box. */
  size?: number | string
  /** Override the default `0 0 200 200` viewBox to crop the drawing. */
  viewBox?: string
  /** Draw the face but not the body — used by the mood picker cards. */
  featuresOnly?: boolean
  /** Draw the body but not the face — used by the shape picker cards. */
  bodyOnly?: boolean
  /** Solid background rect. Omitted or `null` = transparent. */
  background?: string | null
  /** Override the eye colour instead of deriving it from `color`. */
  features?: string
  /** Uniform scale about the centre, e.g. 0.9 to inset the drawing. */
  scale?: number
  /** Raw SVG transform wrapped around the whole drawing — used by the GIF
   *  exporter to bake one frame of the idle animation into a still. */
  transform?: string
  /** Use this face instead of the mood's resting face (mid-animation frames). */
  face?: FaceSpec
  /** Override the shape's face fit (used when animating between shapes). */
  placement?: FacePlacement
  /** Insert extra markup (defs, style, animate tags) just inside the root. */
  head?: string
  /** Wrap the drawing in `<g id="...">` so exporters can target it. */
  groupId?: string
  /** Pretty-print with newlines — nicer for a downloaded .svg file. */
  pretty?: boolean
}

/** Assemble a complete, standalone SVG document string. */
export function generateBlobSvg(config: BlobConfig, options: GenerateOptions = {}): string {
  const {
    size = VIEWBOX,
    viewBox = `0 0 ${VIEWBOX} ${VIEWBOX}`,
    featuresOnly = false,
    bodyOnly = false,
    background = null,
    features = featureColor(config.color),
    scale = 1,
    transform = '',
    face = moodFace(config.mood),
    placement = shapeFacePlacement(config.shape),
    head = '',
    groupId,
    pretty = false,
  } = options

  // Feature-only picker cards still use the card background as their body role.
  const bodyPaint = featuresOnly ? (background ?? '#09090b') : config.color
  const colors: Record<PaintRole, string> = { features, body: bodyPaint }

  const layers: string[] = []
  if (!featuresOnly) layers.push(`<path d="${shapePath(config.shape)}" fill="${config.color}"/>`)
  if (!bodyOnly) {
    const faceContent = primitivesToMarkup(facePrimitives(face), colors)
    const fit = featuresOnly ? '' : facePlacementTransform(placement)
    layers.push(fit ? `<g transform="${fit}">${faceContent}</g>` : faceContent)
  }

  let drawing = layers.join('')
  if (transform) drawing = `<g transform="${transform}">${drawing}</g>`
  if (scale !== 1) {
    const c = VIEWBOX / 2
    drawing = `<g transform="translate(${c} ${c}) scale(${n(scale)}) translate(${-c} ${-c})">${drawing}</g>`
  }
  if (groupId) drawing = `<g id="${groupId}">${drawing}</g>`

  const bg = background ? `<rect x="-1000" y="-1000" width="3000" height="3000" fill="${background}"/>` : ''

  const sep = pretty ? '\n  ' : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="${viewBox}" fill="none">` +
    [head, bg, drawing].filter(Boolean).map((s) => sep + s).join('') +
    (pretty ? '\n</svg>' : '</svg>')
  )
}

/** How much to scale the drawing so it sits nicely inside a picker tile. */
export const TILE_SCALE = { body: 0.72, face: 1.34 } as const
