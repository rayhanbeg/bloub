/**
 * The intro — the blob's first second and a half, once per page load.
 *
 * The division of labour is deliberate. The *entrance* (fade and scale-up) is
 * Framer Motion's job, because a spring's overshoot is exactly what makes a
 * pop-in feel soft rather than mechanical, and a spring is defined by where it's
 * going, not by a schedule. What follows is the opposite kind of animation: a
 * short scripted performance — the eyes open from a squint, glance left, glance
 * right, and give one deliberate blink — which is a *timeline*, so it's written
 * as one here.
 *
 * Same two rules as `idle.ts`: pure functions, no React, no clock of its own.
 * `useIdleMotion` already counts elapsed seconds, so it just asks this module
 * what the eyes are doing at that moment and hands control back when it's over.
 *
 * Nothing here reaches the exporters. An exported loop *is* the idle animation;
 * a one-off intro at the top of a GIF would be a seam, not a feature.
 *
 *   0.00 ─ 0.14   arrives with its eyes almost shut
 *   0.14 ─ 0.36   eyes open
 *   0.44 ─ 1.06   one continuous glance: left, then right, back to centre
 *   1.12 ─ 1.30   one deliberate blink
 *   1.22 ─ 1.50   gaze control fades back to the idle loop
 */

const TAU = Math.PI * 2

/** Total length of the scripted part, in seconds. */
export const INTRO_DURATION = 1.5

const OPEN_FROM = 0.14
const OPEN_TO = 0.36
const GLANCE_FROM = 0.44
const GLANCE_TO = 1.06
const BLINK_FROM = 1.12
const BLINK_TO = 1.3
const HANDOVER_FROM = 1.22

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
 * @param t Seconds since the blob mounted. Past `INTRO_DURATION` this returns
 *   the resting face with `idleMix` at 1, so an overrun is harmless.
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
  // A half-sine, so it's zero outside its own window and needs no branch.
  const deliberate = Math.sin(span(t, BLINK_FROM, BLINK_TO) * Math.PI) * BLINK_DEPTH

  return {
    gazeX: sweep * GAZE_REACH,
    gazeY: lift,
    // Whichever lid is lower wins, so the opening and the blink can't cancel out.
    blink: Math.min(opening, 1 - deliberate),
    idleMix: smooth(span(t, HANDOVER_FROM, INTRO_DURATION)),
  }
}
