/**
 * Pointer tracking for the eyes.
 *
 * This hook answers one question — "where is the cursor, relative to *this*
 * blob's face?" — and answers it into a mutable object rather than into state,
 * because the consumer is a requestAnimationFrame loop. A React render per mouse
 * move would be absurd, and the rest of the animation system already avoids one.
 *
 * Deliberately no clock and no smoothing here. `useIdleMotion` owns the single rAF
 * loop this app has, and easing belongs where the frame delta is — so what this
 * produces is a *target*, not a position.
 */

import { useEffect, useRef } from 'react'
import { FACE_ORIGIN } from '../core/face'
import { VIEWBOX } from '../core/generateBlob'
import { gazeToward } from '../core/gaze'

/** How long a pointer that has stopped moving stays interesting, in ms. */
const ATTENTION_SPAN = 3200

/** The current pointer-driven gaze target. Mutated in place, never replaced. */
export interface PointerGaze {
  /** Horizontal offset in viewBox units — same scale as `MoodMotion.gazeX`. */
  x: number
  /** Vertical offset. Negative looks up. */
  y: number
  /**
   * 0 → 1: how much the pointer should own the gaze. A step function, not a
   * ramp — the animation loop crossfades it.
   */
  attention: number
}

export interface PointerTracking {
  /** Attach to the element whose box contains the face. */
  ref: React.RefObject<SVGSVGElement>
  /** Stable across renders, so an animation loop can just keep reading it. */
  gaze: PointerGaze
}

/**
 * @param enabled Off means the listeners are never attached and `attention` stays
 *   at 0, which the loop reads as "no cursor" — so a caller can pass this
 *   straight through from a prop without branching on it.
 */
export function usePointerGaze(enabled: boolean): PointerTracking {
  const ref = useRef<SVGSVGElement>(null)
  /*
   * One object for the component's whole life. `useRef(...).current` is the trick
   * for "a mutable value that survives renders but isn't a ref I hand to the
   * DOM"; a fresh object per pointer event would be garbage for the loop to chase.
   */
  const gaze = useRef<PointerGaze>({ x: 0, y: 0, attention: 0 }).current

  useEffect(() => {
    if (!enabled) return

    // `ReturnType<typeof setTimeout>` rather than `number`: TypeScript resolves
    // this to Node's `Timeout` or the DOM's `number` depending on which lib is in
    // scope, and asking for the return type sidesteps having to care.
    let forget: ReturnType<typeof setTimeout> | undefined

    const look = (event: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const box = el.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) return

      /*
       * The face is not at the centre of the box — `FACE_ORIGIN` puts it a little
       * above. The same fraction of the *rendered* box is where the eyes are on
       * screen, and because `getBoundingClientRect` reports the transformed box,
       * that holds however the element is scaled: the editor's 0.85 character
       * scale and the intro camera's close-up both come out right for free.
       */
      const faceX = box.left + (box.width * FACE_ORIGIN.x) / VIEWBOX
      const faceY = box.top + (box.height * FACE_ORIGIN.y) / VIEWBOX

      const target = gazeToward(
        (event.clientX - faceX) / (box.width / 2),
        (event.clientY - faceY) / (box.height / 2),
      )
      gaze.x = target.x
      gaze.y = target.y
      gaze.attention = 1

      /*
       * A pointer that has stopped moving stops being news. Handing the gaze back
       * to the idle drift after a few seconds keeps a parked cursor from freezing
       * the eyes mid-stare — and it makes the next twitch of the mouse read as the
       * blob noticing you again, which is the moment the whole feature is for.
       */
      clearTimeout(forget)
      forget = setTimeout(() => {
        gaze.attention = 0
      }, ATTENTION_SPAN)
    }

    const away = () => {
      clearTimeout(forget)
      gaze.attention = 0
    }

    /*
     * A finger is only *there* while it's down, so touch hands the gaze back on
     * release: tracking a drag is a nice surprise, a gaze frozen where the last
     * tap landed is not. A mouse doesn't leave when its button does.
     */
    const release = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') away()
    }

    window.addEventListener('pointermove', look, { passive: true })
    window.addEventListener('pointerup', release, { passive: true })
    window.addEventListener('pointercancel', away, { passive: true })
    // Off the window, or off the tab, both count as looking away.
    document.addEventListener('mouseleave', away)
    window.addEventListener('blur', away)

    return () => {
      away()
      window.removeEventListener('pointermove', look)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', away)
      document.removeEventListener('mouseleave', away)
      window.removeEventListener('blur', away)
    }
  }, [enabled, gaze])

  return { ref, gaze }
}
