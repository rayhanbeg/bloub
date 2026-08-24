/**
 * Attentive — locked on and listening.
 *
 * The only difference from Neutral is the eyes standing taller and narrower.
 * That restraint is the point: if Attentive needed more than a change of
 * proportion, Neutral would have nothing left to be quieter than.
 */

import type { MoodDef } from "../core/types";

export const attentive = {
  id: "attentive",
  label: "Attentive",
  face: {
    left: { rx: 9.2, ry: 19.4, sq: 2.5, cy: 99 },
    right: { rx: 9.2, ry: 19.4, sq: 2.5, cy: 99 },
  },
  // A shade quicker than Neutral, blinking a little more often — engaged.
  motion: { loopPeriod: 3.8, bob: 1.9, wobble: 1.1, blinkEvery: 3.6 },
} satisfies MoodDef;
