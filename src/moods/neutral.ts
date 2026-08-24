/**
 * Neutral — the resting expression. Defined by an empty override: it *is* the
 * base face. Two big soft capsules, set wide apart, looking straight at you.
 *
 * Every other mood file describes only what it changes from here.
 */

import type { MoodDef } from "../core/types";

export const neutral = {
  id: "neutral",
  label: "Neutral",
  face: {},
} satisfies MoodDef;
