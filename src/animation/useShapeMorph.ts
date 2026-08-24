/**
 * Shape morphing.
 *
 * `flubber` handles the hard part: two paths with different numbers of points
 * can't be interpolated directly, so it resamples both into matched rings and
 * returns a function from progress to path string.
 *
 * Two details make this feel right rather than merely work:
 *
 * - The morph starts from `d.get()` — the path *currently on screen* — not from
 *   the previously selected shape. Interrupt a morph halfway and the next one
 *   picks up from where the blob actually is, instead of snapping.
 * - On completion we write the true authored path back. Flubber's output is a
 *   polygon approximation; at rest the blob should be the real béziers.
 */

import { useEffect, useMemo, useRef } from 'react'
import { animate, motionValue, useMotionValue } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { interpolate } from 'flubber'
import { shapeFacePlacement, shapePath } from '../shapes'

/** Smaller = smoother morph, longer path strings. 2 units on a 200 viewBox. */
const MORPH_RESOLUTION = 2

const MORPH_SPRING = { type: 'spring', stiffness: 150, damping: 20, mass: 1 } as const

/** The face-fit springs are softer, so the face settles just after the body. */
const PLACEMENT_SPRING = { type: 'spring', stiffness: 180, damping: 22, mass: 1 } as const

export interface ShapeMotion {
  /** The body path, mid-morph or at rest. */
  d: MotionValue<string>
  /** Animated face placement for the current shape. */
  faceDx: MotionValue<number>
  faceDy: MotionValue<number>
  faceScale: MotionValue<number>
  /** 0 at rest, spikes to 1 on a shape change — drives the squash reaction. */
  kick: MotionValue<number>
}

export function useShapeMorph(shapeId: string): ShapeMotion {
  const initial = useMemo(() => shapePath(shapeId), [])
  const initialFit = useMemo(() => shapeFacePlacement(shapeId), [])

  const d = useMotionValue(initial)
  const faceDx = useMotionValue(initialFit.dx)
  const faceDy = useMotionValue(initialFit.dy)
  const faceScale = useMotionValue(initialFit.scale)
  const kick = useMotionValue(0)

  const isFirstRun = useRef(true)

  useEffect(() => {
    const target = shapePath(shapeId)
    const fit = shapeFacePlacement(shapeId)

    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    const from = d.get()
    const stops: Array<() => void> = []

    if (from !== target) {
      let interpolator: (t: number) => string
      try {
        interpolator = interpolate(from, target, { maxSegmentLength: MORPH_RESOLUTION })
      } catch {
        // Any path flubber can't reconcile falls back to a hard set rather than
        // leaving the blob frozen mid-shape.
        d.set(target)
        interpolator = () => target
      }

      // A fresh progress value per transition. `motionValue()` is the non-hook
      // constructor, which is what we need inside an effect.
      const progress = motionValue(0)
      const unsubscribe = progress.on('change', (t) => d.set(interpolator(t)))
      const run = animate(progress, 1, {
        ...MORPH_SPRING,
        onComplete: () => d.set(target),
      })
      stops.push(() => {
        unsubscribe()
        run.stop()
      })
    }

    stops.push(animate(faceDx, fit.dx, PLACEMENT_SPRING).stop)
    stops.push(animate(faceDy, fit.dy, PLACEMENT_SPRING).stop)
    stops.push(animate(faceScale, fit.scale, PLACEMENT_SPRING).stop)

    // A quick squash-and-recover so the body reacts to being reshaped.
    kick.set(1)
    stops.push(animate(kick, 0, { type: 'spring', stiffness: 210, damping: 14, mass: 0.7 }).stop)

    return () => stops.forEach((stop) => stop())
  }, [shapeId, d, faceDx, faceDy, faceScale, kick])

  return { d, faceDx, faceDy, faceScale, kick }
}
