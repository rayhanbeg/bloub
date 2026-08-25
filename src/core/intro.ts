/**
 * The intro — the blob's first couple of seconds, once per page load.
 *
 * The intro is a camera move followed by a performance, and the two halves are
 * built out of deliberately different machinery.
 *
 * The camera pull-back (`animation/useCameraReveal.ts`) is a *transition*: it has
 * a start, an end, and an easing curve, which is exactly what Framer Motion is
 * for. What follows is the opposite kind of animation — a short scripted moment
 * where the eyes open from a squint, glance left, glance right, and give one
 * deliberate blink. That's a *timeline*, not a target to settle on, so it's
 * written as one here.
 *
 * Same two rules as `idle.ts`: pure functions, no React, no clock of its own.
 * `useIdleMotion` already counts elapsed seconds, so it just asks this module
 * what the eyes are doing at that moment and hands control back when it's over.
 *
 * Nothing here reaches the exporters. An exported loop *is* the idle animation;
 * a one-off intro at the top of a GIF would be a seam, not a feature.
 *
 * Times below are relative to the script's own start, which the caller offsets by
 * `INTRO_FACE_DELAY` so it lands under the tail of the camera move:
 *
 *   ·    ─ 0.00   held in a squint for the whole close-up
 *   0.00 ─ 0.22   eyes open as the blob comes into focus
 *   0.30 ─ 0.92   one continuous glance: left, then right, back to centre
 *   0.98 ─ 1.16   one deliberate blink
 *   1.08 ─ 1.36   gaze control fades back to the idle loop
 */

const TAU = Math.PI * 2

/** Total length of the scripted part, in seconds. */
export const INTRO_DURATION = 1.36

/**
 * How long after mount the face script starts.
 *
 * Deliberately a little *before* the camera finishes: the eyes come open while
 * the blob is still coming into focus, which reads as the reveal and the waking
 * up being one gesture rather than two animations queued back to back.
 */
export const INTRO_FACE_DELAY = 0.72

const OPEN_FROM = 0
const OPEN_TO = 0.22
const GLANCE_FROM = 0.3
const GLANCE_TO = 0.92
const BLINK_FROM = 0.98
const BLINK_TO = 1.16
const HANDOVER_FROM = 1.08

/** How wide the glance reaches, in viewBox units — a mood's `gazeX` is 1.6–3. */
const GAZE_REACH = 2.8
/** How far the eyes are open on arrival. Enough to read as a squint, not a line. */
const ARRIVAL_LID = 0.12
/** Depth of the deliberate blink. Slightly deeper than an idle one. */
const BLINK_DEPTH = 0.96

/** Progress through `[from, to]`, clamped to 0…1. */
const span = (t: number, from: number, to: number): number =>
  t <= from ? 0 : t >= to ? 1 : (t - from) / (to - from)

/** Smoothstep: eases in and out, with zero velocity at both ends. */
const smooth = (u: number): number => u * u * (3 - 2 * u)

/** What the eyes are doing partway through the intro. */
export interface IntroFace {
  /** Horizontal gaze offset in viewBox units — same scale as `MoodMotion.gazeX`. */
  gazeX: number
  /** Vertical gaze offset. Negative looks up. */
  gazeY: number
  /** 1 = open, 0 = shut. Same convention as `blinkAmount`. */
  blink: number
  /**
   * How much of the idle loop's own gaze to let through, 0 → 1.
   *
   * The intro can't simply stop, or the eyes would jump from wherever the script
   * left them to wherever the loop had drifted to. This ramps up over the last
   * quarter-second so the loop takes over underneath a gaze that is already back
   * at centre.
   */
  idleMix: number
}

/**
 * Evaluate the intro.
 *
 * @param t Seconds since the script started — i.e. already offset by
 *   `INTRO_FACE_DELAY`. Negative values return the arrival state, so the blob
 *   holds its squint through the close-up; past `INTRO_DURATION` it returns the
 *   resting face with `idleMix` at 1, so an overrun is harmless too.
 */
export function introAt(t: number): IntroFace {
  const glance = span(t, GLANCE_FROM, GLANCE_TO)

  /*
   * One sweep, not two moves. `sin(2πu)` alone travels left → centre → right →
   * centre and lands exactly where it started, but it *leaves* at full speed;
   * multiplying by the `sin(πu)` envelope brings the velocity to zero at both
   * ends too, so the glance starts and finishes without a twitch. The envelope
   * costs amplitude at the extremes (0.707 of it), which √2 puts back.
   */
  const sweep =
    glance <= 0 || glance >= 1
      ? 0
      : -Math.sin(glance * TAU) * Math.sin(glance * Math.PI) * Math.SQRT2

  // Eyes lift very slightly through the glance — a flat sideways look reads as
  // scanning, a lifted one reads as noticing.
  const lift = glance <= 0 || glance >= 1 ? 0 : -Math.sin(glance * Math.PI) * 0.5

  const opening = ARRIVAL_LID + (1 - ARRIVAL_LID) * smooth(span(t, OPEN_FROM, OPEN_TO))
  // A half-sine, guarded at both ends. `sin(π)` is 1.2e-16 rather than 0 in
  // floating point, and without the guard that ghost of a blink would still be
  // riding the eyes for every frame after the intro finished.
  const blinking = span(t, BLINK_FROM, BLINK_TO)
  const deliberate =
    blinking <= 0 || blinking >= 1 ? 0 : Math.sin(blinking * Math.PI) * BLINK_DEPTH

  return {
    gazeX: sweep * GAZE_REACH,
    gazeY: lift,
    // Whichever lid is lower wins, so the opening and the blink can't cancel out.
    blink: Math.min(opening, 1 - deliberate),
    idleMix: smooth(span(t, HANDOVER_FROM, INTRO_DURATION)),
  }
}
