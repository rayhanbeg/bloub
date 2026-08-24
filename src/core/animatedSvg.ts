/**
 * The animated-SVG exporter.
 *
 * Produces a standalone `.svg` file that animates on its own — opened directly
 * in a browser, dropped into an `<img>`, or used as a CSS `background-image`.
 * There is no JavaScript in the output and no external reference of any kind.
 *
 * **Why CSS `@keyframes` and not SMIL.** SMIL (`<animateTransform>`) is the older
 * SVG-native answer and it still works, but it has been on Chrome's deprecation
 * list for years and it can't be turned off by `prefers-reduced-motion`. CSS
 * animation inside an SVG document is honoured everywhere the file might land,
 * and it respects the user's motion preference for free.
 *
 * **Why the transforms look repetitive.** Each keyframe writes the full
 * `translate(…) rotate(…) scale(…) translate(…)` chain rather than relying on
 * `transform-origin`. Baking the origin into the transform sidesteps every
 * disagreement between browsers about what `transform-box` means on an SVG
 * element — the output is longer but it cannot be misinterpreted.
 *
 * The animation is the *same function* the live preview runs: {@link idleAt}
 * sampled at N phases. What you exported is what you were looking at.
 */

import { featureColor } from './geometry'
import { facePlacementTransform } from './face'
import { facePrimitives, primitivesToMarkup, VIEWBOX } from './generateBlob'
import type { PaintRole, Primitive } from './generateBlob'
import { EXPORT_BLINK_PHASE, exportBlinkAt, idleAt } from './idle'
import type { IdleState, MoodMotion } from './idle'
import type { BlobConfig } from './types'
import { moodFace, moodMotion } from '../moods'
import { shapeFacePlacement, shapePath } from '../shapes'

export interface AnimatedSvgOptions {
  /** Rendered width/height in px. The viewBox is always `0 0 200 200`. */
  size?: number
  /** Solid background rect. `null` keeps the file transparent. */
  background?: string | null
  /** Pretty-print the output. Downloaded files default to on. */
  pretty?: boolean
}

const r = (v: number): number => Math.round(v * 1000) / 1000

/** Trim a percentage to something readable: `12.5%`, not `12.500000001%`. */
const pct = (v: number): string => `${Math.round(v * 1e4) / 1e2}%`

/**
 * How many samples the body's keyframe track needs.
 *
 * A 24-step track is plenty for breathing, but a tremble at harmonic 30 is 30
 * oscillations per loop — sampling that 24 times would alias it into a slow
 * wobble. Four samples per oscillation is the floor for it to still read as a
 * vibration, and the whole track is only ~90 bytes per step.
 */
function bodySamples(m: MoodMotion): number {
  const needed = m.tremble === 0 ? 24 : Math.ceil(m.trembleHarmonic * 4)
  return Math.min(Math.max(needed, 24), 144)
}

/** One idle state as a CSS transform. Mirrors `idleTransform` exactly. */
function cssBodyTransform(s: IdleState, c = VIEWBOX / 2): string {
  return (
    `translate(${r(c + s.tx)}px,${r(c + s.ty)}px) ` +
    `rotate(${r(s.rotate)}deg) ` +
    `scale(${r(s.scaleX)},${r(s.scaleY)}) ` +
    `translate(${-c}px,${-c}px)`
  )
}

/** A vertical squash about an arbitrary point — how an eye blinks. */
function cssBlinkTransform(cx: number, cy: number, k: number): string {
  return `translate(${r(cx)}px,${r(cy)}px) scaleY(${r(k)}) translate(${r(-cx)}px,${r(-cy)}px)`
}

interface Track {
  /** Keyframe percentage → declaration value. */
  steps: Array<[number, string]>
}

/** Sample a transform over the loop, closing it by repeating phase 0 at 100%. */
function sampleTrack(samples: number, at: (phase: number) => string): Track {
  const steps: Array<[number, string]> = []
  for (let i = 0; i <= samples; i++) steps.push([i / samples, at((i % samples) / samples)])
  return { steps }
}

/**
 * A blink is a 0.16s event inside a multi-second loop, so it gets its own sparse
 * track instead of riding the body's uniform sampling: flat at 1, five steps
 * through the blink, flat again.
 */
function blinkTrack(m: MoodMotion, at: (open: number) => string): Track {
  const span = Math.min(m.blinkDuration / Math.max(m.loopPeriod, 0.2), 0.4)
  // Keep the whole blink inside the loop so it never has to wrap across 100%.
  const start = Math.min(EXPORT_BLINK_PHASE, 1 - span - 0.001)

  const steps: Array<[number, string]> = [[0, at(1)]]
  for (let i = 0; i <= 4; i++) {
    const phase = start + (span * i) / 4
    steps.push([phase, at(exportBlinkAt(phase, m))])
  }
  steps.push([1, at(1)])
  return { steps }
}

function keyframes(name: string, track: Track, property = 'transform'): string {
  const body = track.steps
    .map(([p, value]) => `${pct(p)}{${property}:${value}}`)
    .join('')
  return `@keyframes ${name}{${body}}`
}

/** Only the primitives with these keys, in the order `facePrimitives` gave them. */
function pick(primitives: Primitive[], keys: readonly string[]): Primitive[] {
  return primitives.filter((p) => keys.includes(p.key))
}

/** `bloub-happy-pebble` — a namespace so two exported blobs can share a page. */
function namespace(config: BlobConfig): string {
  return `bloub-${config.mood}-${config.shape}`.replace(/[^a-zA-Z0-9-]/g, '')
}

/**
 * Build the animated SVG document.
 *
 * Structure, outermost first:
 *
 * ```
 * g.body    → breath, bob, wobble, lean, tremble   (the whole blob)
 *   path                                           (the body)
 *   g        → the shape's face fit (static)
 *     g.gaze → gaze drift                          (both eyes)
 *       g.eyeL → blink                             (left eye + arc + pupil)
 *       g.eyeR → blink
 *     g.brow → half the gaze drift                  (brows track the head)
 *     path…                                        (blush, tear, sweat)
 * ```
 */
export function generateAnimatedSvg(config: BlobConfig, options: AnimatedSvgOptions = {}): string {
  const { size = 512, background = null, pretty = true } = options

  const motion = moodMotion(config.mood)
  const face = moodFace(config.mood)
  const primitives = facePrimitives(face)
  const colors: Record<PaintRole, string> = {
    features: featureColor(config.color),
    body: config.color,
  }

  const ns = namespace(config)
  const cls = {
    body: `${ns}-b`,
    gaze: `${ns}-g`,
    brow: `${ns}-w`,
    eyeL: `${ns}-l`,
    eyeR: `${ns}-r`,
  }

  /* --------------------------------------------------------------- tracks */

  const rules: string[] = []
  const frames: string[] = []
  const dur = `${r(motion.loopPeriod)}s`
  const animated: string[] = []

  const add = (name: string, track: Track): void => {
    rules.push(`.${name}{animation:${name} ${dur} linear infinite}`)
    frames.push(keyframes(name, track))
    animated.push(`.${name}`)
  }

  add(
    cls.body,
    sampleTrack(bodySamples(motion), (phase) => cssBodyTransform(idleAt(phase, motion))),
  )

  const gazes = motion.gazeX !== 0 || motion.gazeY !== 0 || motion.gazeBias !== 0
  if (gazes) {
    add(
      cls.gaze,
      sampleTrack(24, (phase) => {
        const s = idleAt(phase, motion)
        return `translate(${r(s.gazeX)}px,${r(s.gazeY)}px)`
      }),
    )
    add(
      cls.brow,
      sampleTrack(24, (phase) => `translate(${r(idleAt(phase, motion).gazeX * 0.5)}px,0px)`),
    )
  }

  const blinks = motion.blinkDepth > 0.01
  if (blinks) {
    add(cls.eyeL, blinkTrack(motion, (k) => cssBlinkTransform(face.left.cx, face.left.cy, k)))
    add(cls.eyeR, blinkTrack(motion, (k) => cssBlinkTransform(face.right.cx, face.right.cy, k)))
  }

  /* ---------------------------------------------------------------- markup */

  const nl = pretty ? '\n' : ''
  const pad = (depth: number): string => (pretty ? '  '.repeat(depth) : '')

  const wrap = (className: string | null, depth: number, inner: string): string => {
    if (!inner) return ''
    if (!className) return inner
    return `${pad(depth)}<g class="${className}">${nl}${inner}${pad(depth)}</g>${nl}`
  }

  const paths = (keys: readonly string[], depth: number): string => {
    const markup = primitivesToMarkup(pick(primitives, keys), colors)
    return markup ? `${pad(depth)}${markup}${nl}` : ''
  }

  // Depth just controls pretty-print indentation; each optional wrapper that is
  // skipped pulls its children one level out.
  const eyeDepth = 2 + (gazes ? 1 : 0) + (blinks ? 1 : 0)
  const eyeBlock = blinks
    ? wrap(cls.eyeL, eyeDepth - 1, paths(['left.eye', 'left.arc', 'left.pupil'], eyeDepth)) +
      wrap(cls.eyeR, eyeDepth - 1, paths(['right.eye', 'right.arc', 'right.pupil'], eyeDepth))
    : paths(['left.eye', 'left.arc', 'left.pupil'], eyeDepth) +
      paths(['right.eye', 'right.arc', 'right.pupil'], eyeDepth)

  const faceInner =
    (gazes ? wrap(cls.gaze, 2, eyeBlock) : eyeBlock) +
    (gazes
      ? wrap(cls.brow, 2, paths(['left.brow', 'right.brow'], 3))
      : paths(['left.brow', 'right.brow'], 2)) +
    paths(['blush.left', 'blush.right', 'tear', 'sweat'], 2)

  const fit = facePlacementTransform(shapeFacePlacement(config.shape))
  const faceGroup = faceInner
    ? fit
      ? `${pad(2)}<g transform="${fit}">${nl}${faceInner}${pad(2)}</g>${nl}`
      : faceInner
    : ''

  const bodyGroup =
    `${pad(1)}<g class="${cls.body}">${nl}` +
    `${pad(2)}<path d="${shapePath(config.shape)}" fill="${config.color}"/>${nl}` +
    faceGroup +
    `${pad(1)}</g>${nl}`

  const bg = background
    ? `${pad(1)}<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="${background}"/>${nl}`
    : ''

  // Anyone who has asked their system not to animate things gets the blob at
  // rest rather than no blob at all.
  const reduced = `@media(prefers-reduced-motion:reduce){${animated.join(',')}{animation:none}}`

  const style =
    `${pad(1)}<style>${nl}` +
    [...rules, ...frames, reduced].map((line) => `${pad(2)}${line}`).join(nl) +
    `${nl}${pad(1)}</style>${nl}`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" fill="none">${nl}` +
    style +
    bg +
    bodyGroup +
    `</svg>${nl}`
  )
}
