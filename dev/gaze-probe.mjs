/**
 * Does the blob actually watch the cursor?
 *
 * The eyes are drawn by baking `gazeX`/`gazeY` into the path data rather than by
 * transforming the elements, and `getBBox()` ignores ancestor transforms — so the
 * midpoint between the two eye paths' own bounding boxes *is* the gaze, in viewBox
 * units, with nothing to undo. Baseline is measured rather than assumed, because a
 * mood can move the eyes and `gazeBias` can sit them low.
 *
 * Input is dispatched through CDP (`Input.dispatchMouseEvent`), not synthesised in
 * the page, so what the listener sees is a real trusted `pointermove` — a
 * `new PointerEvent(...)` would prove only that the handler runs.
 *
 *   node dev/gaze-probe.mjs http://localhost:5200/
 *
 * Needs a browser on --remote-debugging-port=9333, same as dev/drive.mjs.
 */

const PORT = Number(process.env.PORT ?? 9333)
const base = (process.argv[2] ?? 'http://localhost:5200/').replace(/\/$/, '')

/** Must match `core/gaze.ts`. */
const FOLLOW_REACH = { x: 4.4, y: 3.2 }
/** Must match `usePointerGaze.ts`, in seconds. */
const ATTENTION_SPAN = 3.2

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function browserSocket() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      return (await res.json()).webSocketDebuggerUrl
    } catch {
      await sleep(500)
    }
  }
  throw new Error(`no devtools endpoint on :${PORT}`)
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
const send = (method, params = {}, session) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }))
  })

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
const VIEW = { w: 1280, h: 900 }
await send('Emulation.setDeviceMetricsOverride', {
  width: VIEW.w, height: VIEW.h, deviceScaleFactor: 1, mobile: false,
}, sessionId)

const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text ?? JSON.stringify(res.exceptionDetails))
  return res.result.value
}

/**
 * Move the real pointer, in CSS pixels.
 *
 * Clamped into the viewport, and that clamp is not cosmetic: Chrome hit-tests
 * `Input.dispatchMouseEvent` against the render widget and *silently discards*
 * anything outside it. The first run of this probe aimed 1.4 blob-widths to the
 * right of a hero that sits in the right-hand column, landed at x=1541 on a
 * 1280px viewport, and measured a gaze of exactly zero — not because the eyes
 * weren't tracking but because no event was ever delivered.
 */
const moveTo = (x, y) =>
  send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: Math.round(Math.min(Math.max(x, 2), VIEW.w - 4)),
    y: Math.round(Math.min(Math.max(y, 2), VIEW.h - 4)),
    buttons: 0,
  }, sessionId)

/**
 * Drag the pointer there in steps rather than teleporting it.
 *
 * Not for realism — for coverage. One event is enough to set the target, but a
 * cursor that only ever appears in two places would never exercise the chase, and
 * a still cursor stops generating events at all, which is what the attention
 * timeout is waiting for.
 */
async function sweepTo(x, y, steps = 12, gap = 22) {
  const from = last ?? { x, y }
  for (let i = 1; i <= steps; i++) {
    await moveTo(from.x + ((x - from.x) * i) / steps, from.y + ((y - from.y) * i) / steps)
    await sleep(gap)
  }
  last = { x, y }
}
let last = null

const SAMPLER = `(() => {
  const svg = document.querySelector('svg[aria-label$="blob"]')
  if (!svg) return 'no blob'
  const eyes = [...svg.querySelectorAll('g g path')]
  if (eyes.length !== 2) return 'expected 2 eye paths, got ' + eyes.length
  window.__gaze = []
  const t0 = performance.now()
  const tick = () => {
    const [a, b] = eyes.map((e) => e.getBBox())
    window.__gaze.push({
      t: (performance.now() - t0) / 1000,
      // The midpoint between the eyes: the mood's own cx cancels out of any
      // *difference*, and the baseline pass measures whatever is left.
      x: (a.x + a.width / 2 + b.x + b.width / 2) / 2,
      y: (a.y + a.height / 2 + b.y + b.height / 2) / 2,
      h: a.height,
    })
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  return 'ok'
})()`

const grab = async (clear = true) => {
  const rows = await evaluate(`JSON.stringify(window.__gaze ?? null)`)
  if (clear) await evaluate(`if (window.__gaze) window.__gaze = []`)
  // `null` means the execution context was replaced under us — a navigation or a
  // reload — which is a probe failure worth naming rather than a stack trace.
  return JSON.parse(rows) ?? []
}

const mean = (xs) => xs.reduce((s, v) => s + v, 0) / (xs.length || 1)
const results = []
const check = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? '  ok  ' : ' FAIL '} ${name}${detail ? `  ${detail}` : ''}`)
}

/* ------------------------------------------------------------------ landing */

for (const [label, url] of [['landing hero', `${base}/`], ['editor stage', `${base}/editor`]]) {
  console.log(`\n── ${label}`)
  last = null
  await send('Page.navigate', { url }, sessionId)

  for (let i = 0; i < 40; i++) {
    await sleep(400)
    try {
      if (await evaluate(`!!document.querySelector('svg[aria-label$="blob"] g g path')`)) break
    } catch { /* context swapping */ }
  }
  await sleep(2600) // the intro and the camera reveal, where there is one

  const started = await evaluate(SAMPLER)
  if (started !== 'ok') {
    check(`${label} · sampler attached`, false, started)
    continue
  }

  const rect = await evaluate(
    `JSON.stringify((({left, top, width, height}) => ({left, top, width, height}))(
      document.querySelector('svg[aria-label$="blob"]').getBoundingClientRect()))`,
  ).then(JSON.parse)
  const face = { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.52 }

  // 1 ─ Baseline: no pointer has moved yet, so this is the idle drift alone.
  await sleep(2400)
  const idleOnly = await grab()
  const base0 = { x: mean(idleOnly.map((s) => s.x)), y: mean(idleOnly.map((s) => s.y)) }
  const driftX = Math.max(...idleOnly.map((s) => Math.abs(s.x - base0.x)))
  console.log(`   baseline (${base0.x.toFixed(2)}, ${base0.y.toFixed(2)}), idle drift ±${driftX.toFixed(2)}`)

  // 2 ─ Look right and down, then left and up.
  await sweepTo(face.x + rect.width * 1.4, face.y + rect.height * 0.9)
  await sleep(500)
  const right = await grab()
  await sweepTo(face.x - rect.width * 1.4, face.y - rect.height * 0.9)
  await sleep(500)
  const left = await grab()

  const rx = mean(right.slice(-20).map((s) => s.x))
  const lx = mean(left.slice(-20).map((s) => s.x))
  const ry = mean(right.slice(-20).map((s) => s.y))
  const ly = mean(left.slice(-20).map((s) => s.y))

  check(
    `${label} · eyes follow horizontally`,
    rx - lx > 4 && rx > base0.x && lx < base0.x,
    `right ${rx.toFixed(2)} vs left ${lx.toFixed(2)} (spread ${(rx - lx).toFixed(2)})`,
  )
  check(
    `${label} · eyes follow vertically`,
    ry - ly > 2,
    `down ${ry.toFixed(2)} vs up ${ly.toFixed(2)} (spread ${(ry - ly).toFixed(2)})`,
  )

  // 3 ─ Bounded. The cursor goes to the far corner of the viewport; the eyes must
  //     not chase it there. Budget = the mood's own drift plus the follow reach.
  await sweepTo(1275, 895, 8, 16)
  await sleep(700)
  await sweepTo(4, 4, 8, 16)
  await sleep(700)
  const extremes = await grab()
  const outX = Math.max(...extremes.map((s) => Math.abs(s.x - base0.x)))
  const outY = Math.max(...extremes.map((s) => Math.abs(s.y - base0.y)))
  check(
    `${label} · stays bounded at the screen edges`,
    outX <= FOLLOW_REACH.x + driftX + 0.6 && outY <= FOLLOW_REACH.y + driftX + 0.6,
    `max |Δx| ${outX.toFixed(2)} / ${(FOLLOW_REACH.x + driftX + 0.6).toFixed(2)}, ` +
      `|Δy| ${outY.toFixed(2)} / ${(FOLLOW_REACH.y + driftX + 0.6).toFixed(2)}`,
  )

  // 4 ─ Smoothed, not teleported. One event, far side to far side, then watch how
  //     many frames the eyes take to close 90% of the gap.
  await sweepTo(face.x - rect.width, face.y, 6, 20)
  await sleep(900)
  await grab()
  await moveTo(face.x + rect.width, face.y)
  await sleep(600)
  const jump = await grab()
  const from = jump[0].x
  const to = mean(jump.slice(-6).map((s) => s.x))
  const target = from + (to - from) * 0.9
  const frames = jump.findIndex((s) => (to > from ? s.x >= target : s.x <= target))
  const step = Math.max(...jump.slice(1).map((s, i) => Math.abs(s.x - jump[i].x)))
  check(
    `${label} · eases into the new gaze`,
    frames >= 4 && step < Math.abs(to - from) * 0.45,
    `${frames} frames to 90% (${from.toFixed(2)} → ${to.toFixed(2)}), largest step ${step.toFixed(2)}`,
  )

  // 5 ─ Still blinks while tracking. The lid floors at 8.2 against an open 13.2,
  //     so a full blink reads as ~62% of the open bbox height, never as a line.
  //     Sampling runs until a blink lands rather than for a fixed window: moods
  //     blink every 2.6–6s with jitter on top, and a two-second look is a coin
  //     flip, which is how this check passed once and failed once unchanged.
  const open = Math.max(...jump.map((s) => s.h))
  let shut = open
  let looked = 0
  for (; looked < 60 && shut >= open * 0.75; looked++) {
    await sweepTo(face.x + (looked % 2 ? 1 : -1) * rect.width * 0.8, face.y + (looked % 3 ? 40 : -40), 6, 18)
    const batch = await grab()
    shut = Math.min(shut, ...batch.map((s) => s.h))
  }
  check(
    `${label} · still blinks while tracking`,
    shut < open * 0.75,
    `open ${open.toFixed(2)} → shut ${shut.toFixed(2)} ` +
      `(${((shut / open) * 100).toFixed(0)}% of open, after ${looked} sweeps)`,
  )

  // 6 ─ Hands the gaze back. Park the cursor and stop generating events; after the
  //     attention span the eyes should be back inside the idle drift's own range.
  await sweepTo(face.x + rect.width * 1.4, face.y, 6, 20)
  await sleep(600)
  const held = mean((await grab()).slice(-10).map((s) => s.x))
  await sleep((ATTENTION_SPAN + 1.8) * 1000)
  const released = await grab()
  const back = mean(released.slice(-30).map((s) => s.x))
  check(
    `${label} · loses interest in a parked cursor`,
    Math.abs(back - base0.x) < Math.max(driftX + 0.5, 1.2) && held - base0.x > 2,
    `held at ${held.toFixed(2)}, drifted back to ${back.toFixed(2)} (baseline ${base0.x.toFixed(2)})`,
  )
}

/* -------------------------------------------------------------------- touch */

/*
 * A finger is not a cursor, in two ways.
 *
 * It tracks only while it's down, and hands the gaze back on release rather than
 * waiting out the attention timeout — a gaze parked where the last tap landed
 * would just look stuck.
 *
 * And it only tracks when the browser hasn't claimed the gesture. Chrome fires
 * `pointercancel` the moment a touch turns into a scroll, which the hook treats as
 * looking away, so on the scrollable landing page a swipe falls back to the idle
 * drift — the graceful half of the behaviour. The editor doesn't scroll, so that's
 * where the tracking half is worth measuring.
 *
 * The drag goes *left* on purpose. A rightward touch swipe on a page with nothing
 * to scroll sideways is Chrome's overscroll history-back gesture; the first run of
 * this probe swiped right, navigated the tab off the app mid-measurement, and left
 * the sampler reading an execution context that no longer existed.
 */
console.log('\n── touch, on a phone viewport')
const PHONE = { w: 390, h: 844 }
await send('Emulation.setDeviceMetricsOverride', {
  width: PHONE.w, height: PHONE.h, deviceScaleFactor: 1, mobile: true,
}, sessionId)
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }, sessionId)
await send('Page.navigate', { url: `${base}/editor` }, sessionId)

for (let i = 0; i < 40; i++) {
  await sleep(400)
  try {
    if (await evaluate(`!!document.querySelector('svg[aria-label$="blob"] g g path')`)) break
  } catch { /* context swapping */ }
}
await sleep(2600)
await evaluate(SAMPLER)

const touchRect = await evaluate(
  `JSON.stringify((({left, top, width, height}) => ({left, top, width, height}))(
    document.querySelector('svg[aria-label$="blob"]').getBoundingClientRect()))`,
).then(JSON.parse)
const touchFace = { x: touchRect.left + touchRect.width / 2, y: touchRect.top + touchRect.height * 0.52 }

await sleep(1600)
const touchBase = mean((await grab()).map((s) => s.x))

const finger = (type, x, y) =>
  send('Input.dispatchTouchEvent', {
    type,
    touchPoints:
      type === 'touchEnd'
        ? []
        : [{
            x: Math.round(Math.min(Math.max(x, 2), PHONE.w - 4)),
            y: Math.round(Math.min(Math.max(y, 2), PHONE.h - 4)),
          }],
  }, sessionId)

const dragTo = touchFace.x - touchRect.width * 0.85
await finger('touchStart', touchFace.x, touchFace.y)
for (let i = 1; i <= 10; i++) {
  await finger('touchMove', touchFace.x + ((dragTo - touchFace.x) * i) / 10, touchFace.y)
  await sleep(30)
}
await sleep(450)
const dragSamples = await grab()
const dragged = mean(dragSamples.slice(-10).map((s) => s.x))
check(
  'touch · eyes follow a finger while it drags',
  dragSamples.length > 0 && touchBase - dragged > 2,
  `baseline ${touchBase.toFixed(2)} → ${dragged.toFixed(2)}`,
)

await finger('touchEnd', 0, 0)
await sleep(1700)
const lifted = mean((await grab()).slice(-15).map((s) => s.x))
check(
  'touch · lets go the moment the finger does',
  Math.abs(lifted - touchBase) < 1.2,
  `back to ${lifted.toFixed(2)} within 1.7s of touchEnd, not after the ${ATTENTION_SPAN}s timeout`,
)

ws.close()
const failed = results.filter((r) => !r.pass)
console.log(
  failed.length
    ? `\n${failed.length}/${results.length} failed: ${failed.map((f) => f.name).join(', ')}`
    : `\nall ${results.length} checks passed`,
)
process.exit(failed.length ? 1 : 0)
