/**
 * Dump every mood's *asked-for* eye geometry next to what actually renders.
 *
 * `resolveFace` runs each mood through `normalizeOpenEye`, which was added to keep
 * older mood files inside the house style. This prints both sides of that so the
 * question "are these moods actually distinct?" can be answered with numbers
 * instead of by squinting at a screenshot.
 *
 *   node dev/mood-geometry.mjs [--csv]
 *
 * Bundles the TypeScript with esbuild (already a Vite dependency) rather than
 * needing a loader.
 */

import { build } from 'esbuild'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const dir = mkdtempSync(join(tmpdir(), 'bloub-moods-'))
const entry = join(dir, 'entry.ts')
writeFileSync(
  entry,
  `
  import { MOODS } from '../../../src/moods'
  import { resolveFace } from '../../../src/core/face'
  export const rows = MOODS.map((m) => ({
    id: m.id,
    label: m.label,
    asked: m.face,
    got: resolveFace(m.face),
  }))
  `.replace(/\.\.\/\.\.\/\.\.\//g, `${process.cwd().replace(/\\/g, '/')}/`),
)

const out = join(dir, 'bundle.mjs')
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'warning' })
const { rows } = await import(pathToFileURL(out).href)
rmSync(dir, { recursive: true, force: true })

const n = (v) => (v === undefined ? '·' : String(Math.round(v * 100) / 100))
const eye = (e) =>
  e.op > 0.002
    ? `${n(e.rx)}×${n(e.ry)} sq${n(e.sq)} @${n(e.cx)},${n(e.cy)} rot${n(e.rot)}`
    : `arc w${n(e.arc.w)} bend${n(e.arc.bend)} th${n(e.arc.thick)} @${n(e.cx)},${n(e.cy + e.arc.dy)}`
const asked = (e) => (e ? `${n(e.rx)}×${n(e.ry)} sq${n(e.sq)} @${n(e.cx)},${n(e.cy)}` : '—')

if (process.argv.includes('--csv')) {
  console.log('id,rx,ry,sq,cx,cy,rot,arcOp,browOp,pupilOp')
  for (const r of rows) {
    const l = r.got.left
    console.log([r.id, l.rx, l.ry, l.sq, l.cx, l.cy, l.rot, l.arc.op, l.brow.op, l.pupil.op].join(','))
  }
} else {
  console.log('mood            rendered left                         rendered right                       asked (L / R)                       extras asked')
  for (const r of rows) {
    const a = r.asked
    const extras = [
      a.left?.arc?.op || a.right?.arc?.op ? 'arc' : null,
      a.left?.brow?.op || a.right?.brow?.op ? 'brow' : null,
      a.left?.pupil?.op || a.right?.pupil?.op ? 'pupil' : null,
      a.blush ? 'blush' : null,
      a.tear?.op ? 'tear' : null,
      a.sweat?.op ? 'sweat' : null,
    ].filter(Boolean)
    console.log(
      `${r.id.padEnd(15)} ${eye(r.got.left).padEnd(36)} ${eye(r.got.right).padEnd(36)} ` +
        `${asked(a.left).padEnd(17)} / ${asked(a.right).padEnd(17)} ${extras.join(',') || '—'}`,
    )
  }

  // How many distinct rendered geometries are there, really? Two moods that draw
  // the same silhouette are indistinguishable at a glance however different their
  // source files look, so the signature covers every band that actually renders.
  const band = (c) => (c.op > 0.002 ? `${c.w}/${c.bend}/${c.thick}/${c.wave}/${c.rot}/${c.dx}/${c.dy}` : '-')
  const signature = (r) =>
    [r.got.left, r.got.right]
      .map((e) =>
        [
          e.op > 0.002 ? `${e.rx}|${e.ry}|${e.sq}|${e.rot}` : '-',
          band(e.arc),
          band(e.brow),
          `${e.cx}|${e.cy}`,
        ].join('~'),
      )
      .join('//')
  const buckets = new Map()
  for (const r of rows) {
    const key = signature(r)
    buckets.set(key, [...(buckets.get(key) ?? []), r.id])
  }
  console.log(`\n${rows.length} moods → ${buckets.size} distinct rendered eye geometries`)
  for (const [, ids] of [...buckets].sort((a, b) => b[1].length - a[1].length)) {
    if (ids.length > 1) console.log(`   identical (${ids.length}): ${ids.join(', ')}`)
  }
}
