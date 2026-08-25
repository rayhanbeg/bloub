/**
 * The camera pull-back — the blob's reveal on first load.
 *
 * The blob starts as a close-up: scaled up until it fills the screen, centred on
 * the *viewport* rather than on the preview area, and very slightly out of focus.
 * It holds there for a beat, then pulls back into its resting size and position
 * as it comes sharp. One element, one transform, no second copy of the blob.
 *
 * Two things make this work:
 *
 * - **The close-up is measured, not guessed.** The preview box's size and
 *   position depend on the viewport and the breakpoint, so the transform that
 *   takes it from "filling the screen" to "sitting in the stage" can only be
 *   computed from a real rect. It's read in a layout effect and written to the
 *   MotionValues before the browser paints, so there's no frame at resting size.
 * - **The blur is applied under the scale.** CSS filters run before transforms,
 *   so a 3px blur on an element magnified 3× paints as roughly 9px on screen —
 *   and gets tighter on its own as the camera pulls back. Racking into focus is
 *   most of the effect, and it costs one small number.
 */

import { useLayoutEffect, useRef, useState } from 'react'
import { animate, useMotionTemplate, useMotionValue } from 'framer-motion'
import type { MotionValue } from 'framer-motion'

/** How long the close-up is held before the camera starts moving. */
const HOLD = 0.34
/** How long the pull-back itself takes. */
const PULL_BACK = 0.82
/** The blur at full zoom, in element-local pixels — magnified by the scale. */
const CLOSE_UP_BLUR = 3.2

/**
 * A strong ease-out, and deliberately not a spring.
 *
 * A spring overshoots, and an overshoot at the end of a camera move reads as the
 * blob being on a rubber band. A camera decelerates and stops: nearly all the
 * distance is covered early, and the last few percent take the rest of the time.
 */
const CAMERA_EASE = [0.16, 1, 0.3, 1] as const

/**
 * How much of the viewport's shorter side the blob's body covers at full zoom.
 * Over 1, so the close-up crops slightly rather than sitting neatly inside the
 * frame — which is what makes it read as *close* rather than merely large.
 */
const FILL = 1.12

/**
 * The blob's body, as a fraction of the preview box.
 *
 * The box is square, the body occupies about 160 of the 200 viewBox units inside
 * it, and `CHARACTER_SCALE` shrinks the whole drawing to 0.85. Without this the
 * close-up would be measured against the invisible padding around the blob and
 * would land noticeably short.
 */
const BODY_FRACTION = (160 / 200) * 0.85

export interface CameraReveal {
  /** Attach to the element being revealed — it gets measured. */
  ref: React.RefObject<HTMLDivElement>
  /** Spread into `style` on the same element. */
  style: {
    scale: MotionValue<number>
    x: MotionValue<number>
    y: MotionValue<number>
    opacity: MotionValue<number>
    filter: MotionValue<string> | string
  }
  /**
   * True once the camera has stopped. The reveal has to paint over the panel and
   * the rail to fill the screen, which is a thing you want for exactly as long as
   * the camera is moving and not one moment longer.
   */
  revealed: boolean
}

export function useCameraReveal(play: boolean): CameraReveal {
  const ref = useRef<HTMLDivElement>(null)

  const scale = useMotionValue(1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const opacity = useMotionValue(play ? 0 : 1)
  const blur = useMotionValue(0)

  // `useMotionTemplate` builds a string MotionValue from numeric ones — the
  // right tool for `filter`, which takes a function-call string rather than a
  // bare number. (Note it is *not* usable for `transform`: Framer Motion composes
  // that property itself from `x`/`scale`/etc., and would discard a string.)
  const filter = useMotionTemplate`blur(${blur}px)`

  const [revealed, setRevealed] = useState(!play)

  useLayoutEffect(() => {
    const el = ref.current
    if (!play || !el) return

    // Where the camera has to end up. `getBoundingClientRect` reports the
    // *transformed* box, so anything a previous run of this effect left on the
    // element is divided back out first — StrictMode invokes layout effects
    // twice, and a second pass that measured its own close-up would compute a
    // scale of 1 and reveal nothing. Scaling is about the centre, so only the
    // translation moves it.
    const box = el.getBoundingClientRect()
    const width = box.width / scale.get()
    const centre = {
      x: box.left + box.width / 2 - x.get(),
      y: box.top + box.height / 2 - y.get(),
    }
    const viewport = { w: window.innerWidth, h: window.innerHeight }

    // Enough scale for the body to cover the viewport's shorter side, and the
    // offset that moves the box's centre to the viewport's.
    const closeUp = (FILL * Math.min(viewport.w, viewport.h)) / (width * BODY_FRACTION)
    scale.set(closeUp)
    x.set(viewport.w / 2 - centre.x)
    y.set(viewport.h / 2 - centre.y)
    blur.set(CLOSE_UP_BLUR)

    const camera = { delay: HOLD, duration: PULL_BACK, ease: CAMERA_EASE }
    const running = [
      // The fade is quick and finishes during the held close-up, so the first
      // thing on screen is the blob already large, not a blob growing.
      animate(opacity, 1, { duration: 0.28, ease: 'easeOut' }),
      animate(scale, 1, { ...camera, onComplete: () => setRevealed(true) }),
      animate(x, 0, camera),
      animate(y, 0, camera),
      // Focus lands well before the movement does. Racking in sharply and then
      // gliding to a stop is how a real pull-back reads; blur that clears exactly
      // as the motion stops reads as a fade.
      animate(blur, 0, { delay: HOLD, duration: PULL_BACK * 0.55, ease: 'easeOut' }),
    ]
    return () => running.forEach((a) => a.stop())
  }, [play, scale, x, y, opacity, blur])

  return {
    ref,
    style: {
      scale,
      x,
      y,
      opacity,
      // A lingering `blur(0px)` is not free — any filter but `none` keeps the
      // element on its own rasterised layer and makes it a containing block. Drop
      // it the moment it has nothing left to do.
      filter: revealed ? 'none' : filter,
    },
    revealed,
  }
}

/** Total time from load until the camera stops, for scheduling the chrome. */
export const REVEAL_SETTLES = HOLD + PULL_BACK
