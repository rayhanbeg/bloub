/**
 * Headless driver for the `dev/*-probe.html` harnesses.
 *
 * The probes report their own results into the page, so all a runner has to do is
 * open one, wait for it to finish, and read the table back out. That turns out to
 * need real browser automation rather than Edge's `--screenshot` flag:
 *
 * - `--screenshot` fires as soon as the page loads, long before an async probe
 *   has run, and `--virtual-time-budget` (the usual fix) fast-forwards timers so
 *   aggressively that a probe waiting on a worker never gets to finish.
 * - Edge clamps its *window* to ~496px wide, so a genuine 390px viewport — and
 *   therefore genuine `sm:`/`lg:` media-query evaluation — is unreachable from
 *   the command line. `Emulation.setDeviceMetricsOverride` sets the viewport
 *   itself and is not clamped.
 * - Clipboard read-back needs a granted permission, which only the protocol can
 *   do (`Browser.grantPermissions`).
 *
 * Start a browser with a debugging port, then run this:
 *
 *   msedge --headless=new --remote-debugging-port=9333 \
 *          --user-data-dir=/tmp/edge-cdp about:blank &
 *   node dev/drive.mjs http://localhost:5199/dev/export-probe.html
 *   VW=390 VH=844 SHOT=out.png node dev/drive.mjs http://localhost:5199/
 *
 * Exits 0 when the page's title settles on `PASS`, 1 otherwise — so it can gate
 * a commit. Env: PORT, VW, VH, SHOT, SHOTDELAY, TIMEOUT, NOWAIT (skip the
 * PASS/FAIL wait, for pages that never set a verdict, like the app itself).
 */

import { writeFileSync } from 'node:fs'

const PORT = Number(process.env.PORT ?? 9333)
const url = process.argv[2]
const shot = process.env.SHOT ?? process.argv[3]
const timeout = Number(process.env.TIMEOUT ?? 600_000)

if (!url) {
  console.error('usage: node dev/drive.mjs <url> [screenshot.png]')
  process.exit(2)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** The browser may still be starting up, so retry the discovery endpoint. */
async function browserSocket() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      return (await res.json()).webSocketDebuggerUrl
    } catch {
      await sleep(500)
    }
  }
  throw new Error(`no devtools endpoint on :${PORT} — is the browser running with --remote-debugging-port?`)
}

const ws = new WebSocket(await browserSocket())
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = reject
})

let nextId = 0
const pending = new Map()
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  const entry = msg.id && pending.get(msg.id)
  if (!entry) return
  pending.delete(msg.id)
  msg.error ? entry.reject(new Error(JSON.stringify(msg.error))) : entry.resolve(msg.result)
}

/** One CDP call. `session` targets a page; omit it for browser-level domains. */
const send = (method, params = {}, session) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }))
  })

await send('Browser.grantPermissions', {
  origin: new URL(url).origin,
  permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
})

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
await send(
  'Emulation.setDeviceMetricsOverride',
  {
    width: Number(process.env.VW ?? 1000),
    height: Number(process.env.VH ?? 1500),
    deviceScaleFactor: 1,
    mobile: false,
  },
  sessionId,
)
await send('Page.navigate', { url }, sessionId)

const evaluate = async (expression) => {
  const res = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  )
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text)
  return res.result.value
}

const startedAt = Date.now()
let title = ''
while (Date.now() - startedAt < timeout) {
  await sleep(1500)
  try {
    title = await evaluate('document.title')
  } catch {
    continue // navigation in flight; the context will be back next tick
  }
  if (title === 'PASS' || title === 'FAIL' || process.env.NOWAIT) break
}

const readout = await evaluate(`
  [...document.querySelectorAll('#rows tr')]
    .map((tr) => [...tr.children].map((td) => td.textContent.trim()).join(' | '))
    .join(String.fromCharCode(10))
`)
console.log(`title=${title || '(never settled)'}  after ${Math.round((Date.now() - startedAt) / 1000)}s\n`)
if (readout) console.log(readout)

if (shot) {
  // Give the page a beat to paint after the viewport override before capturing.
  await sleep(Number(process.env.SHOTDELAY ?? 2000))
  const { data } = await send('Page.captureScreenshot', {}, sessionId)
  writeFileSync(shot, Buffer.from(data, 'base64'))
  console.log(`\nscreenshot → ${shot}`)
}

ws.close()
process.exit(process.env.NOWAIT ? 0 : title === 'PASS' ? 0 : 1)
