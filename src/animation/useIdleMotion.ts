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
import { blinkAmount, DEFAULT_MOTION, gazeLean, idleAt, idleTransform } from '../core/idle'
import type { MoodMotion } from '../core/idle'
import { INTRO_DURATION, INTRO_FACE_DELAY, introAt } from '../core/intro'
import { moodMotion } from '../moods'
import type { PointerGaze } from './usePointerGaze'

/** How fast motion parameters chase a new mood's values, in e-folds/second. */
const PARAM_EASE_RATE = 4.5

/**
 * How fast the eyes chase the cursor, in e-folds/second — a ~140ms time constant.
 *
 * This is the lerp that makes tracking feel like looking rather than like being
 * wired to the mouse. Much faster and every jitter in the pointer is on the face;
 * much slower and the eyes are visibly running late.
 */
const FOLLOW_EASE_RATE = 7

/**
 * How fast the gaze changes hands between the idle drift and the cursor. Slower
 * than the chase on purpose — noticing you and losing interest are both gradual.
 */
const ATTENTION_EASE_RATE = 2.6

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
  /**
   * Where the cursor is, if this blob is watching one — see `usePointerGaze`.
   *
   * Read every frame rather than depended on, so the object must be stable across
   * renders. When it's absent, or its `attention` is 0, the gaze is exactly what
   * it was before this option existed.
   */
  follow?: PointerGaze
}

export function useIdleMotion({
  moodId,
  kick,
  enabled = true,
  intro = false,
  follow,
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
  /** True while the second half of a double blink is still pending. */
  const pairedBlink = useRef(false)

  /**
   * The smoothed pointer gaze, and how much of the gaze it currently owns.
   *
   * Both are eased, and both have to be: easing only the weight would still snap
   * the eyes between mouse positions while the weight sat at 1, and easing only
   * the position would make the handover back to the idle drift a jump cut.
   */
  const watching = useRef({ x: 0, y: 0, weight: 0 })

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

    // Chase the cursor. Both terms are frame-rate independent for the same reason
    // the parameter easing is: `1 - e^(-dt·rate)` is the fraction of the remaining
    // distance to close in `dt`, which a fixed 0.1 would not be.
    const w = watching.current
    const chase = 1 - Math.exp(-dt * FOLLOW_EASE_RATE)
    w.x += ((follow?.x ?? 0) - w.x) * chase
    w.y += ((follow?.y ?? 0) - w.y) * chase
    w.weight +=
      ((follow?.attention ?? 0) - w.weight) * (1 - Math.exp(-dt * ATTENTION_EASE_RATE))

    if (!enabled) {
      blink.set(1)
      bodyRef.current?.removeAttribute('transform')
      // Following a cursor is a response, not an idle animation, so it survives
      // the idle switch being off. With no drift underneath, the pointer is the
      // entire gaze.
      gazeX.set(w.x * w.weight)
      gazeY.set(w.y * w.weight)
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

    /*
     * The ambient gaze: where the eyes rest when nothing is scripting them. That's
     * the idle drift, crossfaded with the cursor if there's a cursor to watch.
     *
     * Crossfaded rather than summed. Both terms are bounded — the drift by the
     * mood's `gazeX`, the cursor by `FOLLOW_REACH` — but adding two bounded things
     * gives you the sum of the bounds, and eyes that far out start to look
     * detached from the face.
     */
    const ambientX = state.gazeX * (1 - w.weight) + w.x * w.weight
    const ambientY = state.gazeY * (1 - w.weight) + w.y * w.weight

    let finalX = ambientX
    let finalY = ambientY

    /*
     * Where the body should lean.
     *
     * `gazeLean` is linear in the gaze, so crossfading the two *leans* gives
     * exactly the lean of the crossfaded gaze — which lets this work from
     * `state.lean` alone, with no need for `idleAt` to also hand back the
     * saccade-free gaze it was computed from.
     */
    const cursorLean = gazeLean(w.x, w.y)
    let leanTx = state.lean.tx * (1 - w.weight) + cursorLean.tx * w.weight
    let leanTy = state.lean.ty * (1 - w.weight) + cursorLean.ty * w.weight
    let leanRot = state.lean.rotate * (1 - w.weight) + cursorLean.rotate * w.weight

    // For its first couple of seconds on screen the intro owns the eyes: it holds
    // them in a squint through the camera's close-up, opens them as the blob
    // comes into focus, walks them left and right, and blinks once. Breathing
    // keeps running underneath — only the gaze and the lids are borrowed, and
    // only until `idleMix` has faded the ambient gaze back in. The cursor waits
    // its turn inside that same handover; nobody interrupts an entrance.
    if (intro && elapsed.current < INTRO_FACE_DELAY + INTRO_DURATION) {
      const scripted = introAt(elapsed.current - INTRO_FACE_DELAY)
      finalX = scripted.gazeX + ambientX * scripted.idleMix
      finalY = scripted.gazeY + ambientY * scripted.idleMix
      // The entrance gets a body to go with it: mixed the same way the gaze is,
      // so the blob leans into its own first look around rather than performing
      // it from the neck up.
      const scriptedLean = gazeLean(scripted.gazeX, scripted.gazeY)
      leanTx = scriptedLean.tx + leanTx * scripted.idleMix
      leanTy = scriptedLean.ty + leanTy * scripted.idleMix
      leanRot = scriptedLean.rotate + leanRot * scripted.idleMix
      blink.set(scripted.blink)
      // Hold the random schedule off until the intro is done, so its deliberate
      // blink isn't stepped on by an idle one landing at the same moment.
      nextBlink.current = Math.max(nextBlink.current, INTRO_FACE_DELAY + INTRO_DURATION + 0.6)
    } else {
      // Randomised blink schedule — the one part that is deliberately not a pure
      // function of phase, because a predictable blink reads as mechanical. It is
      // also untouched by cursor tracking: a blob that watches you should still
      // blink while it does it, or it stops looking like it's alive and starts
      // looking like it's staring.
      if (elapsed.current >= nextBlink.current) {
        blinkStart.current = elapsed.current
        if (!pairedBlink.current && Math.random() < 0.22) {
          /*
           * Blinks come in pairs more often than a uniform schedule ever
           * produces, and the doubles are most of what sells a face as watching
           * rather than ticking. The flag keeps a pair from chaining into a
           * flutter: the second blink always reverts to the normal interval.
           */
          pairedBlink.current = true
          nextBlink.current = elapsed.current + c.blinkDuration + 0.08
        } else {
          pairedBlink.current = false
          const jitter = (Math.random() * 2 - 1) * c.blinkJitter
          nextBlink.current = elapsed.current + Math.max(c.blinkEvery + jitter, 0.8)
        }
      }
      blink.set(blinkAmount(elapsed.current - blinkStart.current, c))
    }

    gazeX.set(finalX)
    gazeY.set(finalY)

    /*
     * Swap the lean `idleAt` baked in for the one the final gaze asks for.
     *
     * `idleAt` leaned toward its *own* drift, which is the right answer for an
     * export and the wrong one the moment a cursor takes the gaze over — the eyes
     * would be on the pointer while the shoulders tipped somewhere else. With no
     * cursor and no intro this difference is exactly zero, which is what keeps the
     * preview pixel-identical to the exported frame.
     */
    state.tx += leanTx - state.lean.tx
    state.ty += leanTy - state.lean.ty
    state.rotate += leanRot - state.lean.rotate

    bodyRef.current?.setAttribute('transform', idleTransform(state))
  })

  return { blink, gazeX, gazeY, bodyRef }
}
