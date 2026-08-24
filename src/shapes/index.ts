/**
 * Shape registry. Add a shape by creating `src/shapes/<name>.ts` and listing it
 * here — nothing else in the app needs to know.
 *
 * Some shapes carry a `face` placement: a triangle is narrow where the eyes go,
 * a capsule is short, a droplet's mass sits high. Rather than compromise the
 * silhouettes, each one states how the face should be fitted into it.
 */

import type { FacePlacement, ShapeDef } from '../core/types'
import { NEUTRAL_PLACEMENT } from '../core/types'
import { circlePath } from './circle'
import { pebblePath } from './pebble'
import { squirclePath } from './squircle'
import { capsulePath } from './capsule'
import { trianglePath } from './triangle'
import { hexagonPath } from './hexagon'
import { cloudPath } from './cloud'
import { dropletPath } from './droplet'

/**
 * TypeScript note: `satisfies` checks this array against `readonly ShapeDef[]`
 * *without* widening the literals inside it. `'circle'` stays the exact string
 * `'circle'` rather than becoming a generic `string`, which is what lets us
 * derive the `ShapeId` union below automatically instead of maintaining it.
 */
export const SHAPES = [
  { id: 'circle', label: 'Circle', path: circlePath },
  { id: 'pebble', label: 'Pebble', path: pebblePath, face: { dy: 2 } },
  { id: 'squircle', label: 'Squircle', path: squirclePath },
  { id: 'capsule', label: 'Capsule', path: capsulePath, face: { dy: -2, scale: 0.94 } },
  // Triangle pinches inward at eye height, so the face moves down into the
  // wider part of the shape and shrinks a little.
  { id: 'triangle', label: 'Triangle', path: trianglePath, face: { dy: 20, scale: 0.82 } },
  { id: 'hexagon', label: 'Hexagon', path: hexagonPath },
  { id: 'cloud', label: 'Cloud', path: cloudPath, face: { dy: 2, scale: 0.94 } },
  // Droplet's mass is in the round head; the tapered tail stays empty.
  { id: 'droplet', label: 'Droplet', path: dropletPath, face: { dy: -10, scale: 0.92 } },
] as const satisfies readonly ShapeDef[]

/** `'circle' | 'pebble' | ...` — derived from the array above. */
export type ShapeId = (typeof SHAPES)[number]['id']

export const DEFAULT_SHAPE: ShapeId = 'circle'

/** Look up a shape, falling back to the default so a bad id can never crash. */
export function getShape(id: string): ShapeDef {
  return SHAPES.find((s) => s.id === id) ?? SHAPES[0]
}

/** The resolved path string for a shape id. */
export function shapePath(id: string): string {
  return getShape(id).path()
}

/** The face placement for a shape id, with defaults filled in. */
export function shapeFacePlacement(id: string): FacePlacement {
  return { ...NEUTRAL_PLACEMENT, ...getShape(id).face }
}
