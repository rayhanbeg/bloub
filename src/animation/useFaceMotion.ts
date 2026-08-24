/**
 * The animation layer: one spring per face property.
 *
 * A mood is ~45 numbers. Rather than treating "neutral → surprised" as one
 * transition, we give every single number its own MotionValue and its own
 * spring. Each eye's ball, arc, pupil and brow then travel independently,
 * arriving at slightly different moments with slightly different overshoot —
 * which is what makes the change read as a face reacting rather than a slide
 * crossfade.
 *
 * MotionValues live outside React state, so all of this animates without a
 * single re-render.
 */

import { useEffect, useMemo, useRef } from 'react'
import { animate, motionValue } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { FACE_KEYS, flattenFace } from '../core/face'
import { moodFace } from '../moods'

/** Every animatable face number, keyed as `'left.arc.bend'` etc. */
export type FaceValues = Record<string, MotionValue<number>>

/**
 * A prefix-scoped accessor. `scope(values, 'left')('arc.bend')` reads
 * `left.arc.bend`. Lets the `<Eye>` component be written once and used twice.
 *
 * TypeScript note: this is a function type — takes a string, returns a
 * MotionValue holding a number.
 */
export type FaceGetter = (key: string) => MotionValue<number>

export const scope = (values: FaceValues, prefix: string): FaceGetter => (key) => {
  const mv = values[`${prefix}.${key}`]
  if (!mv) throw new Error(`Unknown face key: ${prefix}.${key}`)
  return mv
}

/** Organic, lightly bouncy — enough overshoot to feel alive, not cartoonish. */
export const FACE_SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 18,
  mass: 0.9,
} as const

export function useFaceMotion(moodId: string): FaceValues {
  // Created once, on first render, and then mutated by springs forever after.
  const values = useMemo<FaceValues>(() => {
    const initial = flattenFace(moodFace(moodId))
    const out: FaceValues = {}
    for (const key of FACE_KEYS) out[key] = motionValue(initial[key] ?? 0)
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial mood only
  }, [])

  const isFirstRun = useRef(true)

  useEffect(() => {
    const target = flattenFace(moodFace(moodId))
    if (isFirstRun.current) {
      isFirstRun.current = false
      return // already at the target; don't animate in from nowhere on mount
    }
    const running = FACE_KEYS.map((key) => animate(values[key], target[key] ?? 0, FACE_SPRING))
    return () => running.forEach((a) => a.stop())
  }, [moodId, values])

  return values
}
