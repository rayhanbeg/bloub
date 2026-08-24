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
}

export const IDLE_REST: IdleState = {
  tx: 0,
  ty: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  gazeX: 0,
  gazeY: 0,
}

/**
 * Evaluate the idle animation.
 *
 * @param phase Position in the loop, in [0, 1). Values outside wrap naturally.
 */
export function idleAt(phase: number, m: MoodMotion): IdleState {
  const p = phase * TAU

  const breathe = Math.sin(p)
  // Harmonic 2 for the jelly, so it completes two squashes per breath and still
  // lands exactly home at phase 1.
  const jelly = Math.sin(p * 2 + 0.7)

  // A single bounce packed into the first third of the loop. Starts and ends at
  // zero, so it doesn't seam.
  let hop = 0
  if (m.hop !== 0) {
    const window = phase / 0.34
    if (window < 1) hop = -Math.sin(window * Math.PI) * m.hop
  }

  // Two coprime-ish harmonics so the tremble reads as jitter, not as a hum.
  const trembleX = m.tremble === 0 ? 0 : Math.sin(p * m.trembleHarmonic) * m.tremble
  const trembleY =
    m.tremble === 0 ? 0 : Math.cos(p * (m.trembleHarmonic + 3)) * m.tremble * 0.6

  return {
    tx: trembleX,
    ty: -breathe * m.bob + m.sag + hop + trembleY,
    // Breathing is volume-preserving: as it swells vertically it narrows, which
    // is what stops it looking like a zoom.
    scaleX: (1 - breathe * m.breath * 0.65 + jelly * 0.006 * m.wobble) * m.scale,
    scaleY: (1 + breathe * m.breath + jelly * 0.004 * m.wobble) * m.scale * m.squash,
    rotate: jelly * 0.55 * m.wobble + Math.sin(p) * m.lean + m.tilt,
    gazeX: Math.sin(p * m.gazeXHarmonic) * m.gazeX,
    gazeY: ((1 - Math.cos(p)) / 2) * m.gazeY + m.gazeBias,
  }
}

/**
 * How open the eyes are, `1` fully open down to `1 - blinkDepth` shut.
 *
 * @param elapsed Seconds since this blink started. Outside the blink, returns 1.
 */
export function blinkAmount(elapsed: number, m: MoodMotion): number {
  if (elapsed < 0 || elapsed > m.blinkDuration) return 1
  // A half-sine closes and reopens with no hard stop at either end.
  return 1 - Math.sin((elapsed / m.blinkDuration) * Math.PI) * m.blinkDepth
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
