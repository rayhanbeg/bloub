/**
 * BlobPreview — the live, animated blob.
 *
 * Three animation systems compose here, each owning a different concern:
 *
 * - `useShapeMorph`  → the body path and the face's fit inside it
 * - `useFaceMotion`  → one spring per face property, for mood changes
 * - `useIdleMotion`  → the always-running breath, blink and gaze
 *
 * They never fight because they write to different things: the morph owns `d`,
 * the face springs own the face numbers, and idle owns one wrapper `transform`
 * plus the blink and gaze offsets. All of it runs on MotionValues, so the whole
 * animation costs zero React renders.
 *
 * Every visible piece is a `<motion.path>` with position and rotation baked into
 * its path data — no per-element transforms — which keeps what you see here and
 * what lands in an exported file identical.
 */

import { useEffect, useLayoutEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { curvePath, featureColor, superellipsePath } from '../core/geometry'
import { FACE_ORIGIN, blinkRy } from '../core/face'
import { VIEWBOX } from '../core/generateBlob'
import { scope, useFaceMotion } from '../animation/useFaceMotion'
import { useShapeMorph } from '../animation/useShapeMorph'
import { useIdleMotion } from '../animation/useIdleMotion'
import { cn } from '../utils/cn'
import type { FaceGetter } from '../animation/useFaceMotion'
import type { BlobConfig } from '../core/types'

const COLOR_TRANSITION = { duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const

/** Animate a colour MotionValue whenever the target hex changes. */
function useAnimatedColor(target: string): MotionValue<string> {
  const value = useMotionValue(target)
  useEffect(() => {
    const running = animate(value, target, COLOR_TRANSITION)
    return () => running.stop()
  }, [target, value])
  return value
}

interface EyeProps {
  get: FaceGetter
  features: MotionValue<string>
  /** 1 = open, 0 = fully closed. Shared by both eyes so blinks stay in sync. */
  blink: MotionValue<number>
  gazeX: MotionValue<number>
  gazeY: MotionValue<number>
}

function Eye({ get, features, blink, gazeX, gazeY }: EyeProps) {
  const cx = get('cx')
  const cy = get('cy')

  const ball = useTransform(
    [cx, cy, get('rx'), get('ry'), get('sq'), get('rot'), blink, gazeX, gazeY],
    (v: number[]) => {
      const [x, y, rx, ry, sq, rot, b, gx, gy] = v
      return superellipsePath({
        cx: x + gx,
        cy: y + gy,
        rx,
        // Blink formulas live in core/face.ts, shared with the exporters, so a
        // GIF frame and this frame are computed by the same code.
        ry: blinkRy(ry, b),
        rot,
        n: sq,
      })
    },
  )

  void useTransform(
    [
      cx,
      cy,
      get('brow.dx'),
      get('brow.dy'),
      get('brow.w'),
      get('brow.bend'),
      get('brow.thick'),
      get('brow.wave'),
      get('brow.rot'),
      gazeX,
    ],
    (v: number[]) => {
      const [x, y, dx, dy, w, bend, thick, wave, rot, gx] = v
      // Brows follow the gaze at half strength — they're anchored to the head,
      // not to the eyes.
      return curvePath({ cx: x + dx + gx * 0.5, cy: y + dy, w, bend, thick, wave, rot })
    },
  )

  return <motion.path d={ball} fill={features} opacity={get('op')} />
}

/** Blush, tear and sweat — fixed geometry, opacity-driven. */
export interface BlobPreviewProps {
  config: BlobConfig
  /**
   * Rendered size. A number is CSS pixels; a string is passed straight through,
   * so `"100%"` lets a responsive wrapper own the sizing instead.
   *
   * TypeScript note: `number | string` is a *union type* — the value may be
   * either, and anything else (say `true`) is rejected at the call site.
   */
  size?: number | string
  className?: string
  /** Pause the idle loop (used while capturing frames for export). */
  idle?: boolean
  /**
   * Play the one-time "coming to life" script on mount — see `core/intro.ts`.
   * Only the stage preview asks for this; tiles and exports stay at rest.
   */
  intro?: boolean
}

/**
 * The blob is drawn purely from `config`. Exports are generated from the same
 * pure functions rather than scraped from this node, so there is no ref to hand
 * back to the parent — what you see and what you download share a source, not a
 * DOM element.
 */
export function BlobPreview({
  config,
  size = 400,
  className,
  idle = true,
  intro = false,
}: BlobPreviewProps) {
  const values = useFaceMotion(config.mood)
  const shape = useShapeMorph(config.shape)
  const { blink, gazeX, gazeY, bodyRef } = useIdleMotion({
    moodId: config.mood,
    kick: shape.kick,
    enabled: idle,
    intro,
  })

  const bodyColor = useAnimatedColor(config.color)
  const featuresColor = useAnimatedColor(featureColor(config.color))

  // The shape's face-fit, as an SVG transform string.
  const faceFit = useTransform(
    [shape.faceDx, shape.faceDy, shape.faceScale],
    (v: number[]) => {
      const [dx, dy, s] = v
      const { x, y } = FACE_ORIGIN
      return `translate(${dx} ${dy}) translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`
    },
  )

  /**
   * …written to the group's `transform` attribute by hand.
   *
   * This cannot be `<motion.g transform={faceFit}>`. Framer Motion treats
   * `transform` as one of the transform properties it composes itself from
   * `x`/`y`/`scale`, so a `MotionValue<string>` handed to it was stringified into
   * the attribute as `[object Object]` — which the browser then discarded. The
   * face lost its per-shape offset and scale in the preview while every export
   * applied it, so the two disagreed by a couple of units. Setting the attribute
   * directly is the same approach the idle group already uses via `bodyRef`.
   */
  const faceRef = useRef<SVGGElement>(null)
  useLayoutEffect(() => {
    const apply = (t: string) => faceRef.current?.setAttribute('transform', t)
    apply(faceFit.get())
    // `on('change')` returns its own unsubscribe function, which is what React
    // wants back from an effect.
    return faceFit.on('change', apply)
  }, [faceFit])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      fill="none"
      // `block` so a `size="100%"` svg fills its wrapper exactly, with no inline
      // descender gap underneath it.
      className={cn('block', className)}
      aria-label={`${config.mood} blob`}
      role="img"
    >
      {/* Idle motion writes its transform to this group. */}
      <g ref={bodyRef}>
        <motion.path d={shape.d} fill={bodyColor} />
        <g ref={faceRef}>
          <Eye
            get={scope(values, 'left')}
            features={featuresColor}
            blink={blink}
            gazeX={gazeX}
            gazeY={gazeY}
          />
          <Eye
            get={scope(values, 'right')}
            features={featuresColor}
            blink={blink}
            gazeX={gazeX}
            gazeY={gazeY}
          />
        </g>
      </g>
    </svg>
  )
}
