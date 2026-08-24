/**
 * Mood registry. Add a mood by creating `src/moods/<name>.ts` and listing it
 * here — nothing else in the app needs to change.
 *
 * Order is deliberate. It runs calm → positive → playful → uncertain →
 * low-energy → anxious → unhappy, so the grid reads as a spectrum rather than
 * an alphabetical dump, and neighbouring tiles are the ones most worth
 * comparing against each other.
 *
 * Every mood is carried by the eyes alone — there is no mouth in the model at
 * all. See `FaceSpec` in core/types.ts.
 */

import type { FaceSpec, MoodDef } from "../core/types";
import { resolveFace } from "../core/face";
import { resolveMotion } from "../core/idle";
import type { MoodMotion } from "../core/idle";

import { neutral } from "./neutral";
import { attentive } from "./attentive";
import { curious } from "./curious";
import { thinking } from "./thinking";
import { happy } from "./happy";
import { laughing } from "./laughing";
import { excited } from "./excited";
import { blissful } from "./blissful";
import { relieved } from "./relieved";
import { grateful } from "./grateful";
import { lovestruck } from "./lovestruck";
import { starstruck } from "./starstruck";
import { proud } from "./proud";
import { smug } from "./smug";
import { cool } from "./cool";
import { playful } from "./playful";
import { winking } from "./winking";
import { mischievous } from "./mischievous";
import { sneaky } from "./sneaky";
import { shy } from "./shy";
import { surprised } from "./surprised";
import { amazed } from "./amazed";
import { confused } from "./confused";
import { skeptical } from "./skeptical";
import { suspicious } from "./suspicious";
import { daydreaming } from "./daydreaming";
import { determined } from "./determined";
import { unimpressed } from "./unimpressed";
import { bored } from "./bored";
import { sleepy } from "./sleepy";
import { nervous } from "./nervous";
import { embarrassed } from "./embarrassed";
import { melancholic } from "./melancholic";
import { sad } from "./sad";
import { crying } from "./crying";
import { frustrated } from "./frustrated";
import { angry } from "./angry";
import { scared } from "./scared";
import { dizzy } from "./dizzy";

export const MOODS = [
  neutral,
  attentive,
  curious,
  thinking,
  happy,
  laughing,
  excited,
  blissful,
  relieved,
  grateful,
  lovestruck,
  starstruck,
  proud,
  smug,
  cool,
  playful,
  winking,
  mischievous,
  sneaky,
  shy,
  surprised,
  amazed,
  confused,
  skeptical,
  suspicious,
  daydreaming,
  determined,
  unimpressed,
  bored,
  sleepy,
  nervous,
  embarrassed,
  melancholic,
  sad,
  crying,
  frustrated,
  angry,
  scared,
  dizzy,
] as const satisfies readonly MoodDef[];

/** `'neutral' | 'happy' | ...` — derived from the array above, so a typo in a
 *  mood id becomes a compile error everywhere it is used. */
export type MoodId = (typeof MOODS)[number]["id"];

export const DEFAULT_MOOD: MoodId = "neutral";

export function getMood(id: string): MoodDef {
  return MOODS.find((m) => m.id === id) ?? MOODS[0];
}

/** The complete, fully-resolved face for a mood id. */
export function moodFace(id: string): FaceSpec {
  return resolveFace(getMood(id).face);
}

/** The complete, fully-resolved idle motion for a mood id. */
export function moodMotion(id: string): MoodMotion {
  return resolveMotion(getMood(id).motion);
}
