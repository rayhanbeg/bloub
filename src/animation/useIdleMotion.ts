/**
 * The live idle-animation driver.
 *
 * One requestAnimationFrame loop owns everything that moves on a clock: the
 * breathing transform, the blink schedule, and the gaze drift. It writes to
 * MotionValues and to one `transform` attribute, so nothing here triggers a
 * React render.
 *
 * Two things worth knowing:
 *
 * - **Phase is advanced by a rate, not read from the clock.** `phase += dt /
 *   loopPeriod`. When a mood change makes the blob breathe faster, the rate
 *   changes but the position in the cycle doesn't jump.
 * - **Motion parameters are eased, not switched.** Moving from Sleepy's 7.5s
 *   breath to Excited's 1.7s instantly would be a visible lurch, so every
 *   parameter is exponentially smoothed toward its target.
 *
 * The same loop plays the one-time intro (`core/intro.ts`) over the eyes when
 * asked, since it's already the thing holding a clock.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useAnimationFrame, useMotionValue } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { blinkAmount, DEFAULT_MOTION, idleAt, idleTransform } from '../core/idle'
import type { MoodMotion } from '../core/idle'
import { INTRO_DURATION, introAt } from '../core/intro'
import { moodMotion } from '../moods'

/** How fast motion parameters chase a new mood's values, in e-folds/second. */
const PARAM_EASE_RATE = 4.5

const MOTION_KEYS = Object.keys(DEFAULT_MOTION) as Array<keyof MoodMotion>

export interface IdleMotion {
  /** 1 = eyes open, 0 = shut. */
  blink: MotionValue<number>
  gazeX: MotionValue<number>
  gazeY: MotionValue<number>
  /** Attach to the group wrapping the whole blob. */
  bodyRef: React.RefObject<SVGGElement>
}

export interface UseIdleOptions {
  moodId: string
  /** Extra squash impulse, 0–1, from a shape change. */
  kick?: MotionValue<number>
  enabled?: boolean
  /**
   * Play the one-time "coming to life" script over the eyes on mount.
   *
   * Off by default, because the picker grids mount a preview per tile and forty
   * blobs all glancing about at once would be a stampede, not a welcome.
   */
  intro?: boolean
}

export function useIdleMotion({
  moodId,
  kick,
  enabled = true,
  intro = false,
}: UseIdleOptions): IdleMotion {
  const bodyRef = useRef<SVGGElement>(null)
  const blink = useMotionValue(1)
  const gazeX = useMotionValue(0)
  const gazeY = useMotionValue(0)

  // The smoothed, currently-in-effect motion parameters.
  const current = useRef<MoodMotion>({ ...moodMotion(moodId) })
  const target = useMemo(() => moodMotion(moodId), [moodId])

  const phase = useRef(0)
  const blinkStart = useRef(-999)
  const nextBlink = useRef(1.5)
  const elapsed = useRef(0)

  // Reset the blink schedule when the mood changes so a new blink rhythm starts
  // promptly instead of waiting out the old interval.
  useEffect(() => {
    nextBlink.current = elapsed.current + Math.max(target.blinkEvery * 0.4, 0.7)
  }, [target])

  useAnimationFrame((_time, delta) => {
    // Clamp dt so a backgrounded tab doesn't resume with one enormous step.
    const dt = Math.min(delta / 1000, 0.05)
    elapsed.current += dt

    // Ease every parameter toward the current mood's target.
    const blendFactor = 1 - Math.exp(-dt * PARAM_EASE_RATE)
    const c = current.current
    for (const key of MOTION_KEYS) {
      c[key] += (target[key] - c[key]) * blendFactor
    }

    if (!enabled) {
      blink.set(1)
      gazeX.set(0)
      gazeY.set(0)
      bodyRef.current?.removeAttribute('transform')
      return
    }

    phase.current = (phase.current + dt / Math.max(c.loopPeriod, 0.2)) % 1

    const state = idleAt(phase.current, c)

    // Fold the shape-change squash into the same transform.
    const k = kick?.get() ?? 0
    if (k > 0.001) {
      state.scaleX *= 1 + k * 0.05
      state.scaleY *= 1 - k * 0.06
    }

    bodyRef.current?.setAttribute('transform', idleTransform(state))

    // For its first moment on screen the intro owns the eyes: it opens them,
    // walks them left and right, and blinks once. Breathing keeps running
    // underneath — only the gaze and the lids are borrowed, and only until
    // `idleMix` has faded the loop's own gaze back in.
    if (intro && elapsed.current < INTRO_DURATION) {
      const scripted = introAt(elapsed.current)
      gazeX.set(scripted.gazeX + state.gazeX * scripted.idleMix)
      gazeY.set(scripted.gazeY + state.gazeY * scripted.idleMix)
      blink.set(scripted.blink)
      // Hold the random schedule off until the intro is done, so its deliberate
      // blink isn't stepped on by an idle one landing at the same moment.
      nextBlink.current = Math.max(nextBlink.current, INTRO_DURATION + 0.6)
      return
    }

    gazeX.set(state.gazeX)
    gazeY.set(state.gazeY)

    // Randomised blink schedule — the one part that is deliberately not a pure
    // function of phase, because a predictable blink reads as mechanical.
    if (elapsed.current >= nextBlink.current) {
      blinkStart.current = elapsed.current
      const jitter = (Math.random() * 2 - 1) * c.blinkJitter
      nextBlink.current = elapsed.current + Math.max(c.blinkEvery + jitter, 0.8)
    }
    blink.set(blinkAmount(elapsed.current - blinkStart.current, c))
  })

  return { blink, gazeX, gazeY, bodyRef }
}
