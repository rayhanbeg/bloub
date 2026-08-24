/**
 * Star-struck — huge round eyes with a big off-centre pupil, leaving a bright
 * crescent of white across the top outer edge of each one.
 *
 * That crescent is the gleam, and it's the only place in the app where the pupil
 * is used as a *highlight* rather than as a pupil. Because the hole is punched
 * in the body colour, pushing it down and inward doesn't read as looking
 * down-and-in — it reads as light catching the top of the eye.
 */

import type { MoodDef } from "../core/types";

export const starstruck = {
  id: "starstruck",
  label: "Star-struck",
  face: {
    left: {
      rx: 11.6,
      ry: 12.8,
      sq: 2,
      cy: 99,
      pupil: { op: 1, dx: 2.4, dy: 2.8, r: 7.2 },
    },
    right: {
      rx: 11.6,
      ry: 12.8,
      sq: 2,
      cy: 99,
      pupil: { op: 1, dx: -2.4, dy: 2.8, r: 7.2 },
    },
    blush: 0.9,
  },
  // Bouncing on the spot and swaying — starry rather than merely surprised.
  motion: {
    loopPeriod: 2.4,
    breath: 0.034,
    bob: 3.2,
    wobble: 1.4,
    lean: 3,
    hop: 4,
    blinkEvery: 4.6,
  },
} satisfies MoodDef;
