/**
 * The intro, from React's side: who plays, when they arrive, and with what spring.
 *
 * The whole sequence has to run exactly once per page load. That's less obvious
 * than it sounds, because "once" can't be a piece of component state:
 *
 * - Switching tabs unmounts and remounts the pickers. A `useState(true)` would
 *   hand every one of them a fresh intro half a second after the user clicked
 *   something, which reads as lag rather than polish.
 * - React's StrictMode mounts every component twice in development, so a flag
 *   flipped in an effect is already spent by the time the real mount happens.
 *
 * So the gate is a clock, read from module scope. Anything that mounts within a
 * few hundred milliseconds of the app's first evaluation is part of the first
 * paint and animates in; anything later is a user action and appears at once.
 */

import { useState } from 'react'
import type { Variants } from 'framer-motion'
import { REVEAL_SETTLES } from './useCameraReveal'

/** When this module was first evaluated — near enough to when the app started. */
const LOADED_AT = performance.now()

const sinceLoad = (): number => (performance.now() - LOADED_AT) / 1000

/** A mount within this long of startup belongs to the first paint. */
const FIRST_PAINT_WINDOW = 0.5

/**
 * Whether something mounting *right now* belongs to the page's first paint.
 *
 * The same question `useIntro` answers, but asked at render time instead of being
 * captured once — which is what a component that outlives the children it
 * orchestrates needs. `ControlPanel` mounts once and re-renders on every tab
 * change, and each change mounts a fresh set of sections; those sections should
 * animate in only if they're part of the intro. A tab switch is a user action,
 * and the controls it asked for belong on screen at once.
 */
export const isFirstPaint = (): boolean => sinceLoad() < FIRST_PAINT_WINDOW

/** Firmer than the camera: the chrome should arrive and stop, not bounce. */
export const CHROME_SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
  mass: 0.8,
} as const

/**
 * When each part of the UI arrives, in seconds.
 *
 * All of it waits for the camera. The reveal only works if the blob is the only
 * thing on screen while it's moving — chrome sliding in around a close-up turns a
 * shot into a page load. The first item is timed to start just before the camera
 * stops, so the two overlap by a hair rather than queueing.
 */
export const INTRO_DELAY = {
  wordmark: REVEAL_SETTLES - 0.2,
  nav: REVEAL_SETTLES - 0.13,
  /** When the first control section starts; the rest follow `SECTION_STAGGER`. */
  sections: REVEAL_SETTLES - 0.07,
  exportBar: REVEAL_SETTLES + 0.05,
} as const

/** Gap between consecutive control sections. */
export const SECTION_STAGGER = 0.08

/**
 * The control sections arrive one after another rather than as a single block.
 *
 * This is the one part of the intro built from Framer Motion's *variants* instead
 * of plain props, because a stagger is precisely what variants are for: the
 * parent names a state, every descendant holding a matching variant follows, and
 * only the parent knows about the gap between them. `Section` never has to be
 * told which delay it ended up with — which matters, because the sections are
 * rendered by five different components that don't know about each other.
 *
 * TypeScript note: `Variants` is a type imported from framer-motion (`import
 * type` — it exists only at compile time and disappears from the bundle).
 * Annotating with it means a misspelled `stagerChildren` is a compile error here
 * rather than a stagger that silently never happens.
 */
export const SECTION_SEQUENCE: Variants = {
  hidden: {},
  shown: {
    transition: {
      delayChildren: INTRO_DELAY.sections,
      staggerChildren: SECTION_STAGGER,
    },
  },
}

/** The matching child state, applied by `Section`. */
export const SECTION_RISE: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { ...CHROME_SPRING, opacity: { duration: 0.42 } },
  },
}

export interface Intro {
  /** True only for the mount that belongs to the page's first paint. */
  play: boolean
}

export function useIntro(): Intro {
  // Captured on first render and never recomputed, so a re-render midway through
  // the intro can't change a component's mind about whether it's playing one.
  // Anything that needs the answer *per mount* rather than per component should
  // call `isFirstPaint()` directly instead.
  const [play] = useState(isFirstPaint)

  return { play }
}

/**
 * Motion props for a piece of chrome that fades and drifts up into place.
 *
 * Spread onto any `motion` element: `<motion.div {...rise(play, 0.3)} />`.
 * `initial={false}` is Framer Motion's "mount already finished" — which is
 * exactly what a page that has nothing to introduce wants.
 */
export function rise(play: boolean, delay: number, y = 10) {
  return {
    initial: play ? { opacity: 0, y } : false,
    animate: { opacity: 1, y: 0 },
    // Opacity on a plain curve rather than the spring: a spring's overshoot is
    // invisible on position but shows up on opacity as a flicker past full.
    transition: { ...CHROME_SPRING, delay, opacity: { duration: 0.42, delay } },
  } as const
}
