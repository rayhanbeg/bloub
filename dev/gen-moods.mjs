/**
 * One-shot generator for src/moods/*.ts. Not part of the app — run, then deleted.
 * It exists only so all 39 mood files get written with consistent numbers in a
 * single pass.
 *
 * Scale reference (NEUTRAL_FACE): cx 77/123, cy 100, rx 10, ry 17.6, sq 2.6.
 * Arc default w 14, bend -8.5, thick 5.4.
 */

import { writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(import.meta.dirname, '..', 'src', 'moods')
const HEAD = `import type { MoodDef } from '../core/types'\n`

const MOODS = []
const mood = (id, label, doc, face, motionDoc, motion) =>
  MOODS.push({ id, label, doc, face, motionDoc, motion })

/* ------------------------------------------------------------------- calm */

mood(
  'neutral',
  'Neutral',
  `Neutral — the resting expression. Defined by an empty override: it *is* the
 * base face. Two big soft capsules, set wide apart, looking straight at you.
 *
 * Every other mood file describes only what it changes from here.`,
  `{}`,
  null,
  null,
)

mood(
  'attentive',
  'Attentive',
  `Attentive — locked on and listening.
 *
 * The only difference from Neutral is the eyes standing taller and narrower.
 * That restraint is the point: if Attentive needed more than a change of
 * proportion, Neutral would have nothing left to be quieter than.`,
  `{
    left: { rx: 9.2, ry: 19.4, sq: 2.5, cy: 99 },
    right: { rx: 9.2, ry: 19.4, sq: 2.5, cy: 99 },
  }`,
  `A shade quicker than Neutral, blinking a little more often — engaged.`,
  `{ loopPeriod: 3.8, bob: 1.9, wobble: 1.1, blinkEvery: 3.6 }`,
)

mood(
  'curious',
  'Curious',
  `Curious — lifted eyes, one standing noticeably taller than the other.
 *
 * The height mismatch is the whole expression. Two matched wide eyes read as
 * surprise; one stretching further than the other reads as *interest*, because
 * it looks like the face is still adjusting to what it's seeing.`,
  `{
    left: { rx: 10.2, ry: 19.4, sq: 2.4, cy: 97 },
    right: { rx: 10.2, ry: 14, sq: 2.4, cy: 101 },
  }`,
  `Leans in and peers, gaze sweeping slowly across — looking *at* something.`,
  `{
    loopPeriod: 4.6,
    bob: 1.6,
    wobble: 1.3,
    lean: 4,
    tilt: 2.5,
    gazeX: 2.4,
    gazeXHarmonic: 1,
    blinkEvery: 3.4,
  }`,
)

mood(
  'thinking',
  'Thinking',
  `Thinking — both eyes narrowed and shifted up and off to one side.
 *
 * Moving *both* eyes by the same amount is what makes this read as a glance
 * rather than as a misaligned face. Narrowing them is what separates working on
 * a problem from Daydreaming, which drifts off with its eyes wide open.`,
  `{
    left: { cx: 82, cy: 97, rx: 8.8, ry: 13.6, sq: 2.7 },
    right: { cx: 128, cy: 97, rx: 8.8, ry: 13.6, sq: 2.7 },
  }`,
  `A slow lean with the gaze drifting further up and away.`,
  `{
    loopPeriod: 5.2,
    breath: 0.018,
    bob: 1.4,
    wobble: 0.6,
    lean: 3.5,
    tilt: 3,
    gazeX: 2.4,
    gazeXHarmonic: 1,
    gazeY: -1.8,
    blinkEvery: 4,
  }`,
)

/* --------------------------------------------------------------- positive */

mood(
  'happy',
  'Happy',
  `Happy — the canonical \`^ ^\`: both eyes closed into soft upward arcs, with a
 * light blush.
 *
 * This is the middle of the closed-arc family on purpose. It sets the reference
 * every other happy mood is measured against — Laughing squeezes harder and
 * narrower, Blissful spreads wider and heavier, Proud sits higher and thinner,
 * Grateful bows inward, Love-struck tips outward. Happy is just *happy*.`,
  `{
    left: { op: 0, cy: 99, arc: { op: 1, w: 14.5, bend: -7, thick: 5.6 } },
    right: { op: 0, cy: 99, arc: { op: 1, w: 14.5, bend: -7, thick: 5.6 } },
    blush: 0.5,
  }`,
  `Light and quick without tipping into frantic.`,
  `{ loopPeriod: 3.2, breath: 0.026, bob: 2.6, wobble: 1.4, blinkEvery: 3.4 }`,
)

mood(
  'laughing',
  'Laughing',
  `Laughing — eyes squeezed shut into the deepest, narrowest arcs in the set,
 * riding high.
 *
 * \`bend: -11.5\` on \`w: 12\` is a hard squeeze rather than a gentle one, and it's
 * the clearest use of the two-forms-per-eye trick: the solid capsule fades out
 * while the arc fades in, and because both are moving and resizing at the same
 * time, the switch reads as a squint rather than a swap.`,
  `{
    left: { op: 0, cy: 96, arc: { op: 1, w: 12, bend: -11.5, thick: 6.2 } },
    right: { op: 0, cy: 96, arc: { op: 1, w: 12, bend: -11.5, thick: 6.2 } },
    blush: 0.4,
  }`,
  `Fast and big, with a shake layered on so the whole body laughs too.`,
  `{
    loopPeriod: 1.9,
    breath: 0.034,
    bob: 3.4,
    wobble: 2,
    tremble: 0.35,
    trembleHarmonic: 16,
    blinkEvery: 3,
  }`,
)

mood(
  'excited',
  'Excited',
  `Excited — the biggest, roundest *open* eyes in the set, lifted high, with a
 * blush.
 *
 * \`sq: 2.1\` is nearly a true ellipse, which is softer than Neutral's rounded
 * capsule and much softer than any of the narrowed moods. Big, round and soft is
 * the whole recipe; the hop in the motion does the rest.`,
  `{
    left: { rx: 11.4, ry: 18.2, sq: 2.1, cy: 97 },
    right: { rx: 11.4, ry: 18.2, sq: 2.1, cy: 97 },
    blush: 0.5,
  }`,
  `The fastest breathing of any mood, plus a hop once per loop.`,
  `{
    loopPeriod: 1.7,
    breath: 0.038,
    bob: 3.6,
    wobble: 1.8,
    hop: 5.5,
    blinkEvery: 2.6,
    blinkJitter: 0.9,
    blinkDuration: 0.12,
  }`,
)

mood(
  'blissful',
  'Blissful',
  `Blissful — wide, heavy, almost-flat closed lids.
 *
 * Separated from the rest of the closed-arc family by **weight**: \`thick: 7.6\`
 * is the heaviest lid here, and a heavy lid on a shallow curve reads as deeply
 * relaxed. Laughing is thin and deeply bent; this is the exact opposite.`,
  `{
    left: { op: 0, cy: 101, arc: { op: 1, w: 17, bend: -3.5, thick: 7.6 } },
    right: { op: 0, cy: 101, arc: { op: 1, w: 17, bend: -3.5, thick: 7.6 } },
    blush: 0.85,
  }`,
  `Almost the slowest loop in the set, floating very slightly upward.`,
  `{ loopPeriod: 6.2, breath: 0.03, bob: 2.2, wobble: 0.7, sag: -1, blinkEvery: 6 }`,
)

mood(
  'relieved',
  'Relieved',
  `Relieved — eyes closed into long, thin, nearly level arcs, plus one bead of
 * cooling sweat.
 *
 * The sweat is what makes this "phew" rather than "content" — the same garnish
 * Nervous and Scared use, kept here as the residue of something that has just
 * stopped being a problem. The long exhale in the motion does the rest.`,
  `{
    left: { op: 0, cy: 102, arc: { op: 1, w: 16, bend: -2, thick: 4.4 } },
    right: { op: 0, cy: 102, arc: { op: 1, w: 16, bend: -2, thick: 4.4 } },
    sweat: { op: 0.55 },
  }`,
  `The deepest breath in the set — a long slow exhale, settling downward.`,
  `{ loopPeriod: 5.5, breath: 0.042, bob: 2.6, wobble: 0.8, sag: 1.5, blinkEvery: 5 }`,
)

mood(
  'grateful',
  'Grateful',
  `Grateful — closed arcs tipped steeply *inward*, so the pair bows toward each
 * other, sitting a little low.
 *
 * The mirrored \`rot: 16\` is the whole idea: dropping the inner ends turns a
 * plain happy squint into a small bow. Warmth aimed at someone else, where
 * Blissful's warmth is aimed at nobody in particular.`,
  `{
    left: { op: 0, cy: 102, arc: { op: 1, w: 13, bend: -6, thick: 5.2, rot: 16 } },
    right: { op: 0, cy: 102, arc: { op: 1, w: 13, bend: -6, thick: 5.2, rot: -16 } },
    blush: 0.5,
  }`,
  `An unhurried breath with the body settling gently down — a nod, not a bounce.`,
  `{ loopPeriod: 5, breath: 0.026, bob: 2, wobble: 0.9, sag: 1.5, blinkEvery: 5.2 }`,
)

mood(
  'lovestruck',
  'Love-struck',
  `Love-struck — deep closed arcs tipped *outward*, full blush, floating.
 *
 * The opposite rotation to Grateful: lifting the inner ends makes the eyes look
 * like they're melting upward. No heart shapes — they would need a primitive
 * nothing else uses, and the giddy sway sells it without one.`,
  `{
    left: { op: 0, cy: 98, arc: { op: 1, w: 15, bend: -9, thick: 5.2, rot: -9 } },
    right: { op: 0, cy: 98, arc: { op: 1, w: 15, bend: -9, thick: 5.2, rot: 9 } },
    blush: 1,
  }`,
  `Floating and swaying — a dreamy lean rather than a sharp bounce.`,
  `{
    loopPeriod: 2.8,
    breath: 0.032,
    bob: 3,
    wobble: 1.5,
    lean: 3.5,
    sag: -1.5,
    blinkEvery: 3.8,
  }`,
)

mood(
  'starstruck',
  'Star-struck',
  `Star-struck — huge round eyes with a big off-centre pupil, leaving a bright
 * crescent of white across the top outer edge of each one.
 *
 * That crescent is the gleam, and it's the only place in the app where the pupil
 * is used as a *highlight* rather than as a pupil. Because the hole is punched
 * in the body colour, pushing it down and inward doesn't read as looking
 * down-and-in — it reads as light catching the top of the eye.`,
  `{
    left: { rx: 11.6, ry: 12.8, sq: 2, cy: 99, pupil: { op: 1, dx: 2.4, dy: 2.8, r: 7.2 } },
    right: { rx: 11.6, ry: 12.8, sq: 2, cy: 99, pupil: { op: 1, dx: -2.4, dy: 2.8, r: 7.2 } },
    blush: 0.9,
  }`,
  `Bouncing on the spot and swaying — starry rather than merely surprised.`,
  `{
    loopPeriod: 2.4,
    breath: 0.034,
    bob: 3.2,
    wobble: 1.4,
    lean: 3,
    hop: 4,
    blinkEvery: 4.6,
  }`,
)

mood(
  'proud',
  'Proud',
  `Proud — thin, relaxed closed arcs sitting higher than any other mood's, over a
 * body that lifts itself.
 *
 * Shallower than Happy and thinner than Blissful, with the negative \`sag\` doing
 * the real work: chin up. Content rather than delighted, and pleased with
 * itself rather than with you.`,
  `{
    left: { op: 0, cy: 96, arc: { op: 1, w: 14, bend: -5.5, thick: 4.8, dy: -1 } },
    right: { op: 0, cy: 96, arc: { op: 1, w: 14, bend: -5.5, thick: 4.8, dy: -1 } },
  }`,
  `Chin up: a negative sag lifts the whole body, and it breathes unhurriedly.`,
  `{
    loopPeriod: 4.8,
    breath: 0.024,
    bob: 1.4,
    wobble: 0.8,
    sag: -4,
    tilt: -1.5,
    blinkEvery: 5,
  }`,
)

mood(
  'smug',
  'Smug',
  `Smug — narrow lids sitting *high* in the face, tipped inward, head cocked.
 *
 * Height is what separates this from every other narrowed-eye mood. Lids high
 * with the body lifted reads as looking down at you; Cool sits level and Bored
 * sits low. The head tilt keeps it amused rather than hostile.`,
  `{
    left: { rx: 11, ry: 5, sq: 3.1, cy: 96, rot: 8 },
    right: { rx: 11, ry: 5, sq: 3.1, cy: 96, rot: -8 },
  }`,
  `Lifted, tilted and slow. Nothing here is in a hurry to be impressed.`,
  `{
    loopPeriod: 4.4,
    breath: 0.02,
    bob: 1.4,
    wobble: 0.7,
    sag: -2,
    tilt: -3.5,
    blinkEvery: 5.4,
    blinkDuration: 0.2,
  }`,
)

mood(
  'cool',
  'Cool',
  `Cool — wide, level, half-lidded lenses.
 *
 * The sunglasses read without any sunglasses. The trick is that these are
 * *half-open lids*, not slits: keeping real height (\`ry: 7.4\`) is what makes it
 * unbothered rather than asleep, and the extra width is what makes it confident
 * rather than deadpan. Unimpressed is this same idea with the height removed.`,
  `{
    left: { rx: 12, ry: 7.4, sq: 3.1, cy: 103 },
    right: { rx: 12, ry: 7.4, sq: 3.1, cy: 103 },
  }`,
  `Unhurried and level, with slow rare blinks. Nothing rattles this one.`,
  `{
    loopPeriod: 4.6,
    breath: 0.018,
    bob: 1.5,
    wobble: 0.6,
    tilt: -1.5,
    blinkEvery: 5.8,
    blinkDuration: 0.2,
  }`,
)

/* ---------------------------------------------------------------- playful */

mood(
  'playful',
  'Playful',
  `Playful — closed happy arcs with a ripple running through them: \`≈ ≈\`.
 *
 * The only mood that puts \`wave\` on the eyes, which makes it instantly findable
 * in a grid of thumbnails. A squiggle is the most cartoonish thing the curve
 * primitive can do, and it lands as goofy delight.`,
  `{
    left: { op: 0, cy: 99, arc: { op: 1, w: 14, bend: -6, thick: 5.4, wave: 3.4 } },
    right: { op: 0, cy: 99, arc: { op: 1, w: 14, bend: -6, thick: 5.4, wave: 3.4 } },
    blush: 0.5,
  }`,
  `The loosest motion in the set: high wobble, a wide lean, and a hop.`,
  `{
    loopPeriod: 2.2,
    breath: 0.032,
    bob: 3.2,
    wobble: 2.1,
    lean: 4,
    hop: 4.5,
    blinkEvery: 2.6,
    blinkJitter: 1,
  }`,
)

mood(
  'winking',
  'Winking',
  `Winking — one eye wide open, the other squeezed shut, with a light blush.
 *
 * The only mood where the two eyes use *different forms* at full strength: a
 * solid capsule on one side, a closed arc on the other.`,
  `{
    left: { rx: 10.2, ry: 17.8, sq: 2.5, cy: 100 },
    right: { op: 0, cy: 100, arc: { op: 1, w: 14, bend: -9, thick: 5.6 } },
    blush: 0.5,
  }`,
  `A neat, deliberate little tilt — this one is in control of the joke.`,
  `{ loopPeriod: 3.4, breath: 0.024, bob: 2.4, wobble: 1.3, tilt: -2, blinkEvery: 4.4 }`,
)

mood(
  'mischievous',
  'Mischievous',
  `Mischievous — chunky tilted crescents with both pupils shoved to one side.
 *
 * Sneaky's cousin, separated from it by weight: Sneaky is two thin flat dashes
 * creeping along, while these are half-open crescents with visible pupils
 * cutting sideways at something. Scheming, and enjoying it.`,
  `{
    left: {
      rx: 11.2,
      ry: 7.6,
      sq: 2.4,
      cy: 98,
      rot: 13,
      pupil: { op: 1, dx: 4, dy: 0, r: 3.4 },
    },
    right: {
      rx: 11.2,
      ry: 7.6,
      sq: 2.4,
      cy: 98,
      rot: -13,
      pupil: { op: 1, dx: 4, dy: 0, r: 3.4 },
    },
    blush: 0.4,
  }`,
  `Bouncy and tilted, with the gaze flicking back and forth twice a loop.`,
  `{
    loopPeriod: 3,
    breath: 0.026,
    bob: 2.4,
    wobble: 1.6,
    lean: 3,
    tilt: 2,
    gazeX: 1.8,
    gazeXHarmonic: 2,
    blinkEvery: 3.2,
  }`,
)

mood(
  'sneaky',
  'Sneaky',
  `Sneaky — thin dashes slanted into a matched V, creeping sideways.
 *
 * Symmetry is what separates this from Suspicious, whose slants are
 * deliberately uneven. A clean mirrored V is a plan; a lopsided one is a doubt.`,
  `{
    left: { rx: 10.2, ry: 3.8, sq: 3.3, cy: 102, rot: 14 },
    right: { rx: 10.2, ry: 3.8, sq: 3.3, cy: 102, rot: -14 },
  }`,
  `Creeping: slow, quiet, with one long sideways glance per loop.`,
  `{
    loopPeriod: 4.8,
    breath: 0.018,
    bob: 1.3,
    wobble: 0.55,
    tilt: 2,
    gazeX: 3,
    gazeXHarmonic: 1,
    blinkEvery: 4.8,
  }`,
)

mood(
  'shy',
  'Shy',
  `Shy — small, narrow, *open* eyes sitting low, full blush, looking away.
 *
 * Open eyes are the difference from Embarrassed, which screws them shut. Shy is
 * still willing to look — just not for long, hence the slow glance away and the
 * body drawing itself in a few percent smaller.`,
  `{
    left: { rx: 7.8, ry: 13.4, sq: 2.6, cy: 103 },
    right: { rx: 7.8, ry: 13.4, sq: 2.6, cy: 103 },
    blush: 1,
  }`,
  `Drawn back and slightly smaller, with a slow look-away once per loop.`,
  `{
    loopPeriod: 5.6,
    breath: 0.03,
    bob: 1.4,
    wobble: 0.5,
    sag: 1.5,
    scale: 0.96,
    gazeX: 3,
    gazeXHarmonic: 1,
    gazeBias: 1.2,
    blinkEvery: 3.6,
  }`,
)

/* ------------------------------------------------------ wonder / unsure */

mood(
  'surprised',
  'Surprised',
  `Surprised — perfectly round ring eyes: a white circle with the body colour
 * punched out of the middle.
 *
 * \`sq: 2\` makes the superellipse a true circle and matching rx/ry keeps it
 * round rather than tall. The centred pupil is what makes it a *ring*, and a
 * ring is the most legible shock signal available without a mouth.`,
  `{
    left: { rx: 11.8, ry: 11.8, sq: 2, cy: 100, pupil: { op: 1, r: 5.6 } },
    right: { rx: 11.8, ry: 11.8, sq: 2, cy: 100, pupil: { op: 1, r: 5.6 } },
  }`,
  `Caught mid-breath: almost frozen, held slightly large, blinking rarely.`,
  `{
    loopPeriod: 3,
    breath: 0.012,
    bob: 0.9,
    wobble: 0.5,
    scale: 1.02,
    blinkEvery: 5.4,
    blinkJitter: 2,
  }`,
)

mood(
  'amazed',
  'Amazed',
  `Amazed — the tallest eyes in the set, with brows lifted clear above them.
 *
 * Three moods here open their eyes wide, and each does it differently:
 * Surprised goes round with a ring, Star-struck adds a gleam and a blush, and
 * Amazed goes *tall* and raises its brows. Awe, looking up at something big.`,
  `{
    left: {
      rx: 11.6,
      ry: 20,
      sq: 2.2,
      cy: 101,
      brow: { op: 1, dy: -29, w: 12, bend: -6, thick: 4 },
    },
    right: {
      rx: 11.6,
      ry: 20,
      sq: 2.2,
      cy: 101,
      brow: { op: 1, dy: -29, w: 12, bend: -6, thick: 4 },
    },
  }`,
  `Held still and lifted, with the gaze drifting slowly upward.`,
  `{
    loopPeriod: 3.6,
    breath: 0.02,
    bob: 1.4,
    wobble: 0.8,
    sag: -2.5,
    gazeY: -1.6,
    blinkEvery: 5.6,
  }`,
)

mood(
  'confused',
  'Confused',
  `Confused — one eye small and low, the other tall and high, both slightly
 * off-angle.
 *
 * Nothing lines up, which is what makes it read as puzzlement rather than as any
 * one clean emotion. Curious mismatches only the *height* of two otherwise
 * identical eyes; this mismatches size, height and rotation at once.`,
  `{
    left: { rx: 8.2, ry: 11.6, sq: 2.8, cy: 105, rot: -6 },
    right: { rx: 11.2, ry: 18.8, sq: 2.4, cy: 97, rot: 4 },
  }`,
  `An off-kilter sway, as if hunting for an angle that makes sense.`,
  `{ loopPeriod: 4.4, wobble: 1.2, lean: 4, tilt: 2.5, blinkEvery: 3 }`,
)

mood(
  'skeptical',
  'Skeptical',
  `Skeptical — one brow up, one down, over two eyes of very different heights.
 *
 * The single raised brow is such a strong signal that it needs almost nothing
 * else. The narrowed eye under the *lowered* brow and the open one under the
 * raised brow are only there so each half of the face agrees with its own brow.`,
  `{
    left: {
      rx: 10.4,
      ry: 7.2,
      sq: 2.9,
      cy: 102,
      brow: { op: 1, dy: -16, w: 12, bend: -2.5, thick: 4, rot: 9 },
    },
    right: {
      rx: 10.2,
      ry: 15.4,
      sq: 2.5,
      cy: 100,
      brow: { op: 1, dy: -28, w: 12, bend: -5, thick: 4, rot: -5 },
    },
  }`,
  `Still and slightly tilted, with one unconvinced sideways look per loop.`,
  `{
    loopPeriod: 4.8,
    breath: 0.016,
    bob: 1.2,
    wobble: 0.6,
    tilt: -2,
    gazeX: 1.6,
    gazeXHarmonic: 1,
    blinkEvery: 5,
  }`,
)

mood(
  'suspicious',
  'Suspicious',
  `Suspicious — narrowed eyes at mismatched angles with both pupils dragged to
 * the outside: a side-eye.
 *
 * The pupils are what make it. Sneaky *glances* sideways by moving the whole
 * eye; here the eyes stay put and only the pupils slide, which is exactly the
 * difference between looking at something and not trusting it.`,
  `{
    left: {
      rx: 10.6,
      ry: 6.2,
      sq: 3,
      cy: 100,
      rot: 8,
      pupil: { op: 1, dx: -4.2, dy: 0, r: 2.9 },
    },
    right: {
      rx: 10.6,
      ry: 6.2,
      sq: 3,
      cy: 101,
      rot: 3,
      pupil: { op: 1, dx: -4.2, dy: 0, r: 2.9 },
    },
  }`,
  `Still and watchful, with one slow sweep per loop.`,
  `{
    loopPeriod: 5,
    breath: 0.016,
    bob: 1.2,
    wobble: 0.5,
    gazeX: 2.2,
    gazeXHarmonic: 1,
    blinkEvery: 4.6,
  }`,
)

mood(
  'daydreaming',
  'Daydreaming',
  `Daydreaming — tall soft eyes riding high, tipped the *same* way as each other
 * and very slightly out of step.
 *
 * Thinking narrows its eyes because it's working; this one has stopped working.
 * Two tricks sell it: a parallel tilt, which reads as unfocused where a mirrored
 * tilt would read as an expression, and a one-unit height difference between the
 * eyes — enough to look absent, not enough to look like Confused's mistake.`,
  `{
    left: { rx: 10.4, ry: 14.6, sq: 2.2, cy: 96, rot: -8 },
    right: { rx: 10.4, ry: 13.4, sq: 2.2, cy: 98, rot: -8 },
    blush: 0.3,
  }`,
  `The longest loop apart from Sleepy, with a wide dreamy lean and an upward gaze.`,
  `{
    loopPeriod: 7,
    breath: 0.026,
    bob: 2.4,
    wobble: 0.8,
    lean: 5,
    sag: -1.5,
    gazeX: 2.6,
    gazeXHarmonic: 1,
    gazeY: -2,
    blinkEvery: 5.6,
    blinkDuration: 0.28,
  }`,
)

/* ----------------------------------------------------- flat / low energy */

mood(
  'determined',
  'Determined',
  `Determined — eyes narrowed from above rather than shut, under low level brows.
 *
 * Angry with the hostility taken out. The eyes stay properly open, the slant is
 * mild (9° against Angry's 22°), and the brows are *straight* — set, not
 * furrowed. Braced for something rather than mad at it.`,
  `{
    left: {
      rx: 10.4,
      ry: 9.8,
      sq: 2.7,
      cy: 100,
      rot: 9,
      brow: { op: 1, dy: -19, w: 12.5, bend: 0, thick: 4.2, rot: 10 },
    },
    right: {
      rx: 10.4,
      ry: 9.8,
      sq: 2.7,
      cy: 100,
      rot: -9,
      brow: { op: 1, dy: -19, w: 12.5, bend: 0, thick: 4.2, rot: -10 },
    },
  }`,
  `Braced: compressed, steady, faster than Neutral but not agitated.`,
  `{
    loopPeriod: 2.6,
    breath: 0.024,
    bob: 1.3,
    wobble: 0.65,
    squash: 0.985,
    blinkEvery: 4.4,
  }`,
)

mood(
  'unimpressed',
  'Unimpressed',
  `Unimpressed — two thin level slits, centred, no slant at all.
 *
 * The deadpan sits exactly between Angry and Sad: the same flat dashes at zero
 * rotation. Taking the tilt away takes the emotion away, which is the joke.
 * Unlike Bored, it is still looking right at you.`,
  `{
    left: { rx: 10.2, ry: 3.6, sq: 3.6, cy: 100 },
    right: { rx: 10.2, ry: 3.6, sq: 3.6, cy: 100 },
  }`,
  `Minimal movement — barely engaged enough to breathe.`,
  `{ loopPeriod: 5.4, breath: 0.012, bob: 0.9, wobble: 0.35, blinkEvery: 5.2 }`,
)

mood(
  'bored',
  'Bored',
  `Bored — dashes drooping in *parallel*, sitting low, gaze wandering off.
 *
 * Every other slanted mood mirrors its two eyes. Tilting both the same way reads
 * as a droop rather than as an expression, which is precisely the point:
 * Unimpressed is looking at you and not caring, Bored has stopped looking.`,
  `{
    left: { rx: 10, ry: 4.2, sq: 3.2, cy: 106, rot: -9 },
    right: { rx: 10, ry: 4.2, sq: 3.2, cy: 106, rot: -9 },
  }`,
  `Long slow sighing breaths, a sag, and a gaze that drifts away and stays away.`,
  `{
    loopPeriod: 6,
    breath: 0.016,
    bob: 1,
    wobble: 0.4,
    sag: 2,
    gazeX: 2.8,
    gazeXHarmonic: 1,
    gazeBias: 0.8,
    blinkEvery: 5.8,
    blinkDuration: 0.26,
  }`,
)

mood(
  'sleepy',
  'Sleepy',
  `Sleepy — short, narrow slits sitting lower than any other mood's.
 *
 * They stay as thin *shapes* rather than closed arcs on purpose: the drowsy slow
 * blink is the whole point here, and a lid can only visibly fall if there is
 * something still open to close.`,
  `{
    left: { rx: 8.6, ry: 3.2, sq: 3.4, cy: 107 },
    right: { rx: 8.6, ry: 3.2, sq: 3.4, cy: 107 },
  }`,
  `The slowest breath in the set, a held head-tilt, and a blink that takes well
  // over a second to close and reopen — all the way shut.`,
  `{
    loopPeriod: 7.5,
    breath: 0.028,
    bob: 2.2,
    wobble: 0.45,
    sag: 2.5,
    tilt: 4,
    blinkEvery: 3.2,
    blinkJitter: 0.7,
    blinkDuration: 1.3,
    blinkDepth: 1,
  }`,
)

/* --------------------------------------------------------------- anxious */

mood(
  'nervous',
  'Nervous',
  `Nervous — eyes cutting sideways with their pupils, slightly mismatched in
 * height, plus one bead of sweat.
 *
 * Suspicious does the same side-eye slowly and from narrowed lids. Nervous does
 * it from eyes that are still wide, flicks the gaze three times a loop, and
 * blinks more often than any other mood. Watchfulness with no confidence in it.`,
  `{
    left: {
      rx: 9.4,
      ry: 14.8,
      sq: 2.5,
      cy: 100,
      pupil: { op: 1, dx: 3.6, dy: 0.8, r: 3.6 },
    },
    right: {
      rx: 9.4,
      ry: 13,
      sq: 2.5,
      cy: 101,
      pupil: { op: 1, dx: 3.6, dy: 0.8, r: 3.6 },
    },
    sweat: { op: 0.8 },
  }`,
  `A fine tremble, darting eyes, and the fastest blink rate of any mood.`,
  `{
    loopPeriod: 2.8,
    breath: 0.02,
    bob: 1.2,
    wobble: 0.7,
    tremble: 0.5,
    trembleHarmonic: 28,
    gazeX: 2,
    gazeXHarmonic: 3,
    blinkEvery: 2,
    blinkJitter: 0.6,
  }`,
)

mood(
  'embarrassed',
  'Embarrassed',
  `Embarrassed — eyes screwed shut into short, thick, low arcs. Full blush, a
 * bead of sweat, and a body shrinking away.
 *
 * A wince. These are the narrowest closed arcs in the set (\`w: 11.5\`), which is
 * what makes them read as *clenched* rather than happy, and the \`scale\` under 1
 * is the face wishing it were somewhere else.`,
  `{
    left: { op: 0, cy: 104, arc: { op: 1, w: 11.5, bend: -3.5, thick: 5.8 } },
    right: { op: 0, cy: 104, arc: { op: 1, w: 11.5, bend: -3.5, thick: 5.8 } },
    blush: 1,
    sweat: { op: 0.5 },
  }`,
  `Shrinking and sinking, with a small tremble underneath.`,
  `{
    loopPeriod: 3.4,
    breath: 0.03,
    bob: 1.6,
    wobble: 0.8,
    sag: 2,
    scale: 0.955,
    tremble: 0.3,
    trembleHarmonic: 24,
    blinkEvery: 3,
  }`,
)

/* --------------------------------------------------------------- unhappy */

mood(
  'melancholic',
  'Melancholic',
  `Melancholic — half-lidded eyes sitting low and shifted bodily to one side.
 * No tear.
 *
 * Sad is acute: slanted, tearful, sagging hard. This is the long quiet version —
 * nothing is distorted, the eyes have simply drifted off centre and settled
 * down. The sideways shift is the tell that separates it from Cool, which sits
 * dead centre and much wider.`,
  `{
    left: { cx: 73, cy: 107, rx: 10, ry: 9, sq: 2.5 },
    right: { cx: 113, cy: 107, rx: 10, ry: 9, sq: 2.5 },
  }`,
  `Very slow and heavy, tilted, with the gaze resting downward throughout.`,
  `{
    loopPeriod: 6.8,
    breath: 0.014,
    bob: 1.1,
    wobble: 0.5,
    sag: 3,
    tilt: 2,
    gazeY: 2,
    gazeBias: 1.4,
    blinkEvery: 5.6,
    blinkDuration: 0.3,
  }`,
)

mood(
  'sad',
  'Sad',
  `Sad — squashed eyes with their *inner* ends lifted steeply, sitting low, and
 * one big tear.
 *
 * Inner corners raised is the universal read for sadness, and it is the exact
 * mirror of Angry. That pair of opposite rotations is the cheapest, clearest
 * emotional signal there is.`,
  `{
    left: { rx: 10.4, ry: 10.2, sq: 2.5, cy: 103, rot: -18 },
    right: { rx: 10.4, ry: 10.2, sq: 2.5, cy: 103, rot: 18 },
    tear: { op: 1, r: 7 },
  }`,
  `Slow heavy breathing, body sagging, gaze drifting down and slowly back.`,
  `{
    loopPeriod: 6.4,
    breath: 0.014,
    bob: 1.1,
    wobble: 0.55,
    sag: 3.5,
    gazeY: 2.6,
    gazeBias: 1,
    blinkEvery: 5.5,
    blinkDuration: 0.24,
  }`,
)

mood(
  'crying',
  'Crying',
  `Crying — eyes screwed shut into *downward* arcs, with the biggest tear in the
 * set.
 *
 * The only mood with a positive \`bend\` on both eyes. Every happy squint curves
 * up; flipping the same primitive over is all it takes, and the sobbing hitch in
 * the motion does the rest.`,
  `{
    left: { op: 0, cy: 102, arc: { op: 1, w: 13.4, bend: 6.5, thick: 5.4 } },
    right: { op: 0, cy: 102, arc: { op: 1, w: 13.4, bend: 6.5, thick: 5.4 } },
    tear: { op: 1, r: 7.5 },
  }`,
  `Sobbing: fast shallow breaths with a hitch (the tremble) layered on top.`,
  `{
    loopPeriod: 2.2,
    breath: 0.03,
    bob: 1.6,
    wobble: 0.9,
    sag: 2.5,
    tremble: 0.55,
    trembleHarmonic: 22,
    blinkEvery: 2.4,
  }`,
)

mood(
  'frustrated',
  'Frustrated',
  `Frustrated — eyes clamped shut into flat, thick bands under steep brows, plus
 * a bead of sweat.
 *
 * The only mood with \`bend: 0\` on a closed eye. Every other shut pair curves one
 * way or the other; a dead-flat band reads as *pressed* shut. The steep brows
 * above supply the anger the eyes can no longer show.`,
  `{
    left: {
      op: 0,
      cy: 101,
      arc: { op: 1, w: 13, bend: 0, thick: 6.6, rot: 6 },
      brow: { op: 1, dy: -13, w: 12, bend: -1.5, thick: 4.6, rot: 17 },
    },
    right: {
      op: 0,
      cy: 101,
      arc: { op: 1, w: 13, bend: 0, thick: 6.6, rot: -6 },
      brow: { op: 1, dy: -13, w: 12, bend: -1.5, thick: 4.6, rot: -17 },
    },
    sweat: { op: 0.6 },
  }`,
  `Held compressed with a hard tremble — something being contained, badly.`,
  `{
    loopPeriod: 2.4,
    breath: 0.028,
    bob: 1.3,
    wobble: 0.85,
    squash: 0.98,
    tremble: 0.6,
    trembleHarmonic: 24,
    blinkEvery: 3.4,
  }`,
)

mood(
  'angry',
  'Angry',
  `Angry — thin dashes slanted so their inner ends drive down, under matching
 * steep brows.
 *
 * Angry and Sad are the same idea at opposite rotations, and this is the steeper
 * of the two (22°). The brows double the slant instead of introducing a new
 * direction, which keeps the whole face pointing at one thing.`,
  `{
    left: {
      rx: 10.2,
      ry: 4,
      sq: 3,
      cy: 100,
      rot: 22,
      brow: { op: 1, dy: -19, w: 12.5, bend: -2, thick: 4.8, rot: 21 },
    },
    right: {
      rx: 10.2,
      ry: 4,
      sq: 3,
      cy: 100,
      rot: -22,
      brow: { op: 1, dy: -19, w: 12.5, bend: -2, thick: 4.8, rot: -21 },
    },
  }`,
  `Sharp shallow breaths, body held compressed, and the fastest vibration in the
  // set — the tell that something is being suppressed.`,
  `{
    loopPeriod: 2.4,
    breath: 0.026,
    bob: 1.2,
    wobble: 0.8,
    squash: 0.975,
    tremble: 0.75,
    trembleHarmonic: 30,
    blinkEvery: 3.2,
  }`,
)

mood(
  'scared',
  'Scared',
  `Scared — tall narrow eyes with a small pupil floating high inside them, plus
 * cold sweat.
 *
 * Tall-and-narrow rather than big-and-round: round eyes read as Surprised, but
 * stretching them vertically reads as fear. The small high pupil leaves white
 * showing all the way around and underneath — the whites-of-the-eyes look — and
 * it is far smaller than Surprised's ring.`,
  `{
    left: { rx: 9.6, ry: 18.8, sq: 2.2, cy: 99, pupil: { op: 1, dy: -2.8, r: 3.8 } },
    right: { rx: 9.6, ry: 18.8, sq: 2.2, cy: 99, pupil: { op: 1, dy: -2.8, r: 3.8 } },
    sweat: { op: 1 },
  }`,
  `Jittery trembling plus eyes darting side to side four times a loop.`,
  `{
    loopPeriod: 2.6,
    breath: 0.018,
    bob: 1,
    wobble: 0.7,
    tremble: 1.1,
    trembleHarmonic: 34,
    gazeX: 2.6,
    gazeXHarmonic: 4,
    blinkEvery: 2.2,
    blinkJitter: 0.8,
  }`,
)

mood(
  'dizzy',
  'Dizzy',
  `Dizzy — two eyes that flatly disagree: one big round ring, one narrow and
 * tall, at different heights and opposite angles.
 *
 * Eyes that don't match read as "the room is spinning" in a way that matched
 * eyes never do. Confused mismatches its eyes too, but keeps both the same
 * *kind* of shape; here one has a pupil and the other doesn't.`,
  `{
    left: { rx: 11.4, ry: 11.4, sq: 2, cy: 96, rot: 8, pupil: { op: 1, r: 4.8 } },
    right: { rx: 7.6, ry: 15.2, sq: 2.4, cy: 105, rot: -10 },
    sweat: { op: 0.65 },
  }`,
  `The widest lean in the set, plus a light tremble — genuinely unsteady.`,
  `{
    loopPeriod: 3,
    breath: 0.022,
    bob: 1.8,
    wobble: 1.6,
    lean: 6.5,
    tremble: 0.4,
    trembleHarmonic: 18,
    blinkEvery: 3,
  }`,
)

/* ------------------------------------------------------------------- emit */

const camel = (id) => id.replace(/-(.)/g, (_, c) => c.toUpperCase())

for (const m of MOODS) {
  const motion = m.motion ? `\n  // ${m.motionDoc}\n  motion: ${m.motion},` : ''
  const source =
    `/**\n * ${m.doc}\n */\n\n` +
    HEAD +
    `\nexport const ${camel(m.id)} = {\n` +
    `  id: '${m.id}',\n` +
    `  label: '${m.label}',\n` +
    `  face: ${m.face},` +
    motion +
    `\n} satisfies MoodDef\n`
  writeFileSync(join(DIR, `${m.id}.ts`), source, 'utf8')
}

// Silly is folded into Playful — the "one eye wide, one shut, mouth askew" idea
// was mostly its mouth, and what was left duplicated Winking.
const silly = join(DIR, 'silly.ts')
if (existsSync(silly)) rmSync(silly)

const order = MOODS.map((m) => m.id)
const index =
  `/**\n` +
  ` * Mood registry. Add a mood by creating \`src/moods/<name>.ts\` and listing it\n` +
  ` * here — nothing else in the app needs to change.\n` +
  ` *\n` +
  ` * Order is deliberate. It runs calm → positive → playful → uncertain →\n` +
  ` * low-energy → anxious → unhappy, so the grid reads as a spectrum rather than\n` +
  ` * an alphabetical dump, and neighbouring tiles are the ones most worth\n` +
  ` * comparing against each other.\n` +
  ` *\n` +
  ` * Every mood is carried by the eyes alone — there is no mouth in the model at\n` +
  ` * all. See \`FaceSpec\` in core/types.ts.\n` +
  ` */\n\n` +
  `import type { FaceSpec, MoodDef } from '../core/types'\n` +
  `import { resolveFace } from '../core/face'\n` +
  `import { resolveMotion } from '../core/idle'\n` +
  `import type { MoodMotion } from '../core/idle'\n\n` +
  order.map((id) => `import { ${camel(id)} } from './${id}'`).join('\n') +
  `\n\nexport const MOODS = [\n` +
  order.map((id) => `  ${camel(id)},`).join('\n') +
  `\n] as const satisfies readonly MoodDef[]\n\n` +
  `/** \`'neutral' | 'happy' | ...\` — derived from the array above, so a typo in a\n` +
  ` *  mood id becomes a compile error everywhere it is used. */\n` +
  `export type MoodId = (typeof MOODS)[number]['id']\n\n` +
  `export const DEFAULT_MOOD: MoodId = 'neutral'\n\n` +
  `export function getMood(id: string): MoodDef {\n` +
  `  return MOODS.find((m) => m.id === id) ?? MOODS[0]\n` +
  `}\n\n` +
  `/** The complete, fully-resolved face for a mood id. */\n` +
  `export function moodFace(id: string): FaceSpec {\n` +
  `  return resolveFace(getMood(id).face)\n` +
  `}\n\n` +
  `/** The complete, fully-resolved idle motion for a mood id. */\n` +
  `export function moodMotion(id: string): MoodMotion {\n` +
  `  return resolveMotion(getMood(id).motion)\n` +
  `}\n`

writeFileSync(join(DIR, 'index.ts'), index, 'utf8')
console.log(`wrote ${MOODS.length} moods + index.ts`)
