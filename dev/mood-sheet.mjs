/**
 * Render every mood as a static SVG sheet, straight from the pure core.
 *
 * `dev/moods-probe.html` does this in the browser by importing the TypeScript
 * through Vite, which is the more faithful test but also the more fragile one —
 * it renders nothing if any module in the graph fails to load, and a blank page
 * looks identical to a page of blank faces. This goes through the same functions
 * the exporters use and writes a file, so a failure is an exception rather than a
 * white rectangle.
 *
 *   node dev/mood-sheet.mjs            → dev/_shots/mood-sheet.html
 */

import { build } from 'esbuild'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd().replace(/\\/g, '/')
const dir = mkdtempSync(join(tmpdir(), 'bloub-sheet-'))
const entry = join(dir, 'entry.ts')
writeFileSync(
  entry,
  `
  import { MOODS } from '${root}/src/moods'
  import { generateBlobSvg } from '${root}/src/core/generateBlob'
  export const cells = MOODS.map((m) => ({
    label: m.label,
    // Face only, no body: nothing but the eyes is being judged here.
    svg: generateBlobSvg(
      { shape: 'circle', mood: m.id, color: '#111113' },
      { size: 132, featuresOnly: true, features: '#111113', background: '#ffffff' },
    ),
  }))
  `,
)

const out = join(dir, 'bundle.mjs')
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'warning' })
const { cells } = await import(pathToFileURL(out).href)
rmSync(dir, { recursive: true, force: true })

const html = `<!doctype html>
<html><body style="margin:0;background:#f4f4f5;font:12px Inter,system-ui,sans-serif;color:#3f3f46">
<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;padding:16px">
${cells
  .map(
    (c) =>
      `<div style="background:#fff;border:1px solid #e4e4e7;border-radius:14px;padding:6px;text-align:center">` +
      `${c.svg}<div style="padding-top:2px">${c.label}</div></div>`,
  )
  .join('\n')}
</div></body></html>`

writeFileSync('dev/_shots/mood-sheet.html', html)
console.log(`${cells.length} moods → dev/_shots/mood-sheet.html`)
