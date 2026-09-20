/**
 * Does every mood's idle loop still close?
 *
 * The whole export story rests on one invariant: every oscillator in `idleAt` is
 * an integer harmonic of the phase, so the state at phase 1 is the state at phase
 * 0 and a GIF or CSS loop can repeat with no crossfade. That invariant is easy to
 * break by accident — a phase warp, a product of sines, a windowed hop — and the
 * symptom is a once-per-loop twitch that a screenshot can't show you.
 *
 * This checks it numerically, and also checks the blink returns to fully open at
 * both ends so a lid can't be left half shut at the seam.
 *
 *   node dev/seam-check.mjs
 */

import { build } from 'esbuild'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd().replace(/\\/g, '/')
const dir = mkdtempSync(join(tmpdir(), 'bloub-seam-'))
const entry = join(dir, 'entry.ts')
writeFileSync(
  entry,
  `
  export { MOODS } from '${root}/src/moods'
  export { moodMotion } from '${root}/src/moods'
  export { idleAt, blinkAmount, exportBlinkAt } from '${root}/src/core/idle'
  `,
)

const out = join(dir, 'bundle.mjs')
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'warning' })
const { MOODS, moodMotion, idleAt, blinkAmount, exportBlinkAt } = await import(pathToFileURL(out).href)
rmSync(dir, { recursive: true, force: true })

const KEYS = ['tx', 'ty', 'scaleX', 'scaleY', 'rotate', 'gazeX', 'gazeY']
/** Tight enough to catch a real seam, loose enough to ignore float noise. */
const EPS = 1e-9

let failures = 0
const fail = (msg) => {
  failures++
  console.log(`  FAIL  ${msg}`)
}

console.log(`── loop seam, ${MOODS.length} moods`)
for (const mood of MOODS) {
  const m = moodMotion(mood.id)
  const a = idleAt(0, m)
  const b = idleAt(1, m)
  for (const k of KEYS) {
    const delta = Math.abs(a[k] - b[k])
    if (delta > EPS) fail(`${mood.id}: ${k} jumps ${delta.toExponential(2)} across the seam`)
  }
  // The hop is windowed into the first third of the loop; make sure the window
  // closes smoothly rather than snapping back at its own edge.
  if (m.hop !== 0) {
    const before = idleAt(0.3399, m)
    const after = idleAt(0.3401, m)
    if (Math.abs(before.ty - after.ty) > 0.02) {
      fail(`${mood.id}: hop window snaps, ty ${before.ty.toFixed(4)} → ${after.ty.toFixed(4)}`)
    }
  }
  // A lid left part-closed at the seam would pop open once per loop.
  if (Math.abs(exportBlinkAt(0, m) - exportBlinkAt(1, m)) > EPS) {
    fail(`${mood.id}: export blink differs at phase 0 vs 1`)
  }
  if (blinkAmount(0, m) !== 1 || blinkAmount(m.blinkDuration, m) !== 1) {
    fail(`${mood.id}: blink does not start and end fully open`)
  }
}

/* The blink curve itself: fast shut, slow open, and actually reaching closed. */
console.log('\n── blink shape')
const m = moodMotion('neutral')
const at = (t) => blinkAmount(t * m.blinkDuration, m)
const deepest = Array.from({ length: 201 }, (_, i) => ({ t: i / 200, v: at(i / 200) })).reduce(
  (lo, s) => (s.v < lo.v ? s : lo),
)
if (deepest.v > 1 - m.blinkDepth + 1e-6) fail(`blink never reaches ${(1 - m.blinkDepth).toFixed(2)}`)
if (deepest.t > 0.45) fail(`blink bottoms out at t=${deepest.t.toFixed(2)} — not a snap`)
console.log(`  shut at t=${deepest.t.toFixed(2)} (open ${deepest.v.toFixed(3)}), closes in ${(deepest.t * 100).toFixed(0)}% of the blink and opens over the other ${((1 - deepest.t) * 100).toFixed(0)}%`)

/* Sampling: the gaze track must clear Nyquist for the saccade harmonics. */
console.log('\n── saccade sampling')
const neutral = moodMotion('neutral')
const SAMPLES = 44
let worst = 0
for (let i = 0; i < SAMPLES; i++) {
  const a = idleAt(i / SAMPLES, neutral).gazeX
  const b = idleAt((i + 0.5) / SAMPLES, neutral).gazeX
  const c = idleAt((i + 1) / SAMPLES, neutral).gazeX
  // How far the true midpoint strays from what linear interpolation between two
  // keyframes would draw — that error *is* the aliasing.
  worst = Math.max(worst, Math.abs(b - (a + c) / 2))
}
console.log(`  ${SAMPLES} samples → worst interpolation error ${worst.toFixed(4)} viewBox units`)
if (worst > 0.12) fail(`gaze track aliases at ${SAMPLES} samples (error ${worst.toFixed(4)})`)

console.log(failures === 0 ? '\nall seam checks passed' : `\n${failures} failed`)
process.exit(failures === 0 ? 0 : 1)
