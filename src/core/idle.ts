/**
 * Idle motion — the blob's resting behaviour, and its per-mood personality.
 *
 * Two design rules make this work everywhere:
 *
 * 1. **Everything is a pure function of a phase in [0, 1).** Not of wall-clock
 *    seconds. The live preview advances the phase by `dt / loopPeriod` each
 *    frame; the exporters sample it from 0 to 1. Same function, so an exported
 *    GIF or animated SVG is the motion you were actually looking at.
 *
 * 2. **Every oscillator is an integer harmonic of that phase.** A sine at
 *    harmonic 2 or 30 still returns to exactly where it started at phase 1,
 *    which is what makes the exported loop seamless with no crossfade.
 *
 * Because the phase is advanced by a *rate* rather than computed from absolute
 * time, a mood change can alter `loopPeriod` mid-cycle without any jump — the
 * blob just starts breathing faster from wherever it happens to be.
 */

import type { DeepPartial } from './types'

const TAU = Math.PI * 2

/**
 * A mood's movement personality. Amplitudes are in viewBox units (the blob is
 * ~160 units across) or as scale deltas, so the numbers stay legible.
 */
export interface MoodMotion {
  /** Seconds for one full breath, and therefore one exported loop. */
  loopPeriod: number
  /** Peak scale change from breathing. 0.02 = ±2%. */
  breath: number
  /** Vertical travel of the bob, in viewBox units. */
  bob: number
  /** Squash-and-stretch jelly intensity. 1 = baseline. */
  wobble: number
  /** Slow rotational sway, degrees — reads as leaning or peering. */
  lean: number
  /** Constant vertical offset. Positive sinks (sad), negative lifts (proud). */
  sag: number
  /** Constant rotation, degrees. A held head-tilt. */
  tilt: number
  /** Constant vertical squash. Below 1 = compressed and tense. */
  squash: number
  /** Constant uniform scale. Below 1 = drawn back, smaller. */
  scale: number
  /** Fast tremble amplitude, in viewBox units. */
  tremble: number
  /** Harmonic of the tremble. Must be an integer to keep the loop seamless. */
  trembleHarmonic: number
  /** Horizontal gaze wander amplitude, in viewBox units. */
  gazeX: number
  /** Harmonic of the horizontal wander. 1 = one sweep per loop. */
  gazeXHarmonic: number
  /** Vertical gaze wander amplitude. Positive drifts down. */
  gazeY: number
  /** Constant gaze offset. Positive = looking down. */
  gazeBias: number
  /** Height of a single hop per loop, in viewBox units. 0 = no hop. */
  hop: number
  /** Average seconds between blinks. */
  blinkEvery: number
  /** Random +/- variation on the blink interval, in seconds. */
  blinkJitter: number
  /** How long one blink takes, in seconds. Large = a slow drowsy lid. */
  blinkDuration: number
  /** How far the lid closes. 1 = fully shut. */
  blinkDepth: number
}

/**
 * The calm baseline — this is "Neutral", and every other mood is a diff from it.
 */
export const DEFAULT_MOTION: MoodMotion = {
  loopPeriod: 4.2,
  breath: 0.02,
  bob: 1.8,
  wobble: 1,
  lean: 0,
  sag: 0,
  tilt: 0,
  squash: 1,
  scale: 1,
  tremble: 0,
  trembleHarmonic: 26,
  gazeX: 0,
  gazeXHarmonic: 1,
  gazeY: 0,
  gazeBias: 0,
  hop: 0,
  blinkEvery: 4.2,
  blinkJitter: 1.6,
  blinkDuration: 0.16,
  blinkDepth: 0.94,
}

/** Fill in a mood's partial motion overrides. */
export function resolveMotion(override?: DeepPartial<MoodMotion>): MoodMotion {
  return { ...DEFAULT_MOTION, ...override }
}

/** The body transform and gaze offset at a given point in the idle cycle. */
export interface IdleState {
  tx: number
  ty: number
  scaleX: number
  scaleY: number
  rotate: number
  gazeX: number
  gazeY: number
  /**
   * The postural lean already folded into `tx`/`ty`/`rotate`.
   *
   * Reported so a caller that overrides the gaze — the live preview, when a
   * cursor takes it over — can back this out exactly instead of guessing.
   */
  lean: GazeLean
}

export const IDLE_REST: IdleState = {
  tx: 0,
  ty: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  gazeX: 0,
  gazeY: 0,
  lean: { tx: 0, ty: 0, rotate: 0 },
}

/**
 * How asymmetric one breath is.
 *
 * `sin(p)` inhales and exhales at exactly the same speed, which is the one thing
 * live bodies never do. Warping the angle by `p + k·sin(p)` runs the clock fast
 * through the upswing and slow through the downswing — a quick draw and a long
 * release — and because `sin(p)` is zero at both 0 and 2π the warp adds nothing
 * at the seam, so the loop still closes exactly.
 */
const BREATH_SKEW = 0.22

/**
 * Micro-saccade amplitude, in viewBox units.
 *
 * Real eyes are never still: they flick in tiny increments even while fixating,
 * and a gaze that holds *perfectly* steady is most of what makes a drawn face
 * read as a sticker. At a third of a unit against a 28-unit eye this is far too
 * small to notice as movement — it's only noticeable when it's missing.
 */
const SACCADE = 0.34

/**
 * The highest harmonic the micro-saccades put into the gaze.
 *
 * `sin(9p)·sin(2p)` is not a harmonic-9 wave — the product expands to harmonics
 * 7 and 11 — so anything that *samples* the gaze into keyframes has to clear
 * Nyquist for 11, not for 9. Exported here so the animated-SVG writer can't drift
 * out of step with this file and quietly alias the flicker into a slow wander.
 */
export const SACCADE_HARMONIC = 11

/**
 * How much the body follows its own eyes.
 *
 * Looking somewhere is a whole-body act: the head leads, the shoulders tip after
 * it. Coupling a little translation and rotation to the gaze is what turns "the
 * eyes moved" into "it looked over there", and it costs one multiply. Deliberately
 * understated — past about half a unit of drift the face starts to swim inside
 * the body instead of carrying it.
 */
const GAZE_LEAN = { tx: 0.3, ty: 0.22, rotate: 0.085 } as const

/** The body's postural response to looking at something. */
export interface GazeLean {
  tx: number
  ty: number
  rotate: number
}

/**
 * The lean that belongs with a given gaze.
 *
 * Split out of `idleAt` because the live preview needs to recompute it: when a
 * cursor takes the gaze over, the body has to lean toward the *cursor*, not toward
 * the idle drift that `idleAt` already baked in. See `useIdleMotion`.
 */
export function gazeLean(gazeX: number, gazeY: number): GazeLean {
  return {
    tx: gazeX * GAZE_LEAN.tx,
    ty: gazeY * GAZE_LEAN.ty,
    rotate: gazeX * GAZE_LEAN.rotate,
  }
}

/**
 * Evaluate the idle animation.
 *
 * @param phase Position in the loop, in [0, 1). Values outside wrap naturally.
 */
export function idleAt(phase: number, m: MoodMotion): IdleState {
  const p = phase * TAU

  // Weighted rather than sinusoidal — see BREATH_SKEW. The bob rides the same
  // curve, so the blob now hangs at the top of its rise and falls away quicker,
  // which is the difference between floating and having weight.
  const breathe = Math.sin(p + BREATH_SKEW * Math.sin(p))
  // Harmonic 2 for the jelly, so it completes two squashes per breath and still
  // lands exactly home at phase 1.
  const jelly = Math.sin(p * 2 + 0.7)
  // Follow-through: the part of a soft body still settling after the breath has
  // already turned around. A third harmonic trailing the second by roughly a
  // quarter cycle, so the two never peak together and the wobble stops reading
  // as a single clean hum.
  const settle = Math.sin(p * 3 + 2.4)
  const wob = (jelly + settle * 0.38) * m.wobble

  // A single bounce packed into the first third of the loop. Starts and ends at
  // zero, so it doesn't seam.
  let hop = 0
  let airborne = 0
  if (m.hop !== 0) {
    const window = phase / 0.34
    if (window < 1) {
      hop = -Math.sin(window * Math.PI) * m.hop
      // Stretch while off the ground and recover on the way down. Tied to the
      // arc itself, so it is zero at take-off and landing and needs no separate
      // envelope to stay seamless.
      airborne = Math.sin(window * Math.PI) * 0.05
    }
  }

  // Two coprime-ish harmonics so the tremble reads as jitter, not as a hum.
  const trembleX = m.tremble === 0 ? 0 : Math.sin(p * m.trembleHarmonic) * m.tremble
  const trembleY =
    m.tremble === 0 ? 0 : Math.cos(p * (m.trembleHarmonic + 3)) * m.tremble * 0.6

  /*
   * Bursty, not constant: a fast harmonic gated by a slow one, so the eyes sit
   * still through part of the loop and flicker through the rest. Both factors are
   * integer harmonics, so their product still lands home at phase 1 — and as a
   * product of sines it expands to harmonics 7 and 11, which is where
   * `SACCADE_HARMONIC` comes from.
   */
  const saccadeX = Math.sin(p * 9 + 2.1) * Math.sin(p * 2) * SACCADE
  const saccadeY = Math.sin(p * 7 + 0.6) * Math.sin(p * 3) * SACCADE * 0.45

  const lookX = Math.sin(p * m.gazeXHarmonic) * m.gazeX
  const lookY = ((1 - Math.cos(p)) / 2) * m.gazeY + m.gazeBias
  /*
   * The lean follows the deliberate look and not the jitter: a saccade moves the
   * eye, never the head. Keeping the fast harmonics out of the body transform
   * also keeps its exported keyframe track at the cheap 24-sample baseline.
   */
  const lean = gazeLean(lookX, lookY)

  return {
    tx: trembleX + lean.tx,
    ty: -breathe * m.bob + m.sag + hop + trembleY + lean.ty,
    // Breathing is volume-preserving: as it swells vertically it narrows, which
    // is what stops it looking like a zoom.
    scaleX: (1 - breathe * m.breath * 0.65 + wob * 0.006 - airborne * 0.8) * m.scale,
    scaleY: (1 + breathe * m.breath + wob * 0.004 + airborne) * m.scale * m.squash,
    rotate: wob * 0.55 + Math.sin(p) * m.lean + m.tilt + lean.rotate,
    gazeX: lookX + saccadeX,
    gazeY: lookY + saccadeY,
    lean,
  }
}

/**
 * How open the eyes are, `1` fully open down to `1 - blinkDepth` shut.
 *
 * Asymmetric on purpose. A lid is pulled shut by a muscle and opens by releasing
 * one, so it snaps down in roughly a third of the blink and drifts back up over
 * the rest; a symmetric half-sine reads as a slow, deliberate wink instead of a
 * blink. Both halves are raised cosines, so the two meet flat at the bottom and
 * leave the ends with no velocity — no hard stop at either extreme.
 *
 * @param elapsed Seconds since this blink started. Outside the blink, returns 1.
 */
export function blinkAmount(elapsed: number, m: MoodMotion): number {
  if (elapsed < 0 || elapsed > m.blinkDuration) return 1
  const t = elapsed / m.blinkDuration
  const CLOSE = 0.38
  const shut =
    t < CLOSE
      ? 0.5 - 0.5 * Math.cos((t / CLOSE) * Math.PI)
      : 0.5 + 0.5 * Math.cos(((t - CLOSE) / (1 - CLOSE)) * Math.PI)
  return 1 - shut * m.blinkDepth
}

/** Phase within the loop at which an exported animation blinks. */
export const EXPORT_BLINK_PHASE = 0.62

/**
 * Deterministic blink for exports: exactly one blink per loop at a fixed phase.
 * Live playback uses a randomised schedule instead, but a loop that has to seam
 * cannot afford randomness.
 */
export function exportBlinkAt(phase: number, m: MoodMotion): number {
  let offset = phase - EXPORT_BLINK_PHASE
  if (offset < 0) offset += 1 // let a blink that straddles phase 1 wrap round
  return blinkAmount(offset * m.loopPeriod, m)
}

/** The SVG transform for an idle state, about the centre of the viewBox. */
export function idleTransform(s: IdleState, cx = 100, cy = 100): string {
  const r = (v: number): number => Math.round(v * 1000) / 1000
  return (
    `translate(${r(cx + s.tx)} ${r(cy + s.ty)}) ` +
    `rotate(${r(s.rotate)}) ` +
    `scale(${r(s.scaleX)} ${r(s.scaleY)}) ` +
    `translate(${r(-cx)} ${r(-cy)})`
  )
}
