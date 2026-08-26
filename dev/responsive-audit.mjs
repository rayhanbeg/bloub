/**
 * Responsive audit for a page, at several viewports, from the outside.
 *
 * "Nothing overflows horizontally" is a claim about layout, not about looks, so
 * it's checked as one: the scroll container's scroll width against its client
 * width, and then — because a page can be exactly as wide as the viewport while
 * one element pokes out under an `overflow-hidden` ancestor — every element's
 * right edge against the viewport's. Anything sticking out is named, with its
 * classes, so the fix has somewhere to go.
 *
 * Two things this had to learn about the app:
 *
 * - **The document doesn't scroll; `#root` does.** `index.css` pins `#root` to
 *   `100dvh` for the editor, and the landing page flips its `overflow` to `auto`
 *   rather than unpinning it. So `documentElement.scrollWidth` is always exactly
 *   the viewport and measuring it proves nothing.
 * - **The first navigation is the slowest.** Vite compiles on demand, so a fixed
 *   sleep audits a blank page on the first viewport and a warm one thereafter.
 *   It waits for real content instead.
 *
 * Also reports the computed size of each heading, which is the other half of the
 * question: a heading that fits because it wrapped onto five lines is not fine.
 *
 *   node dev/responsive-audit.mjs http://localhost:5200/ [outdir]
 *
 * Needs a browser on --remote-debugging-port=9333, same as dev/drive.mjs.
 */

import { writeFileSync } from 'node:fs'

const PORT = Number(process.env.PORT ?? 9333)
const url = process.argv[2]
const outDir = process.argv[3] ?? 'dev/_shots'

/**
 * `mobile` is set for the phone widths on purpose: it switches the emulated
 * scrollbar to the overlay kind, which is what a phone has. Left off, a 375px
 * device reports a 360px client width and every measurement is 15px out.
 */
const VIEWPORTS = [
  { name: 'narrow', w: 320, h: 640, mobile: true },
  { name: 'mobile', w: 375, h: 812, mobile: true },
  { name: 'tablet', w: 768, h: 1024, mobile: true },
  { name: 'desktop', w: 1280, h: 900, mobile: false },
]

if (!url) {
  console.error('usage: node dev/responsive-audit.mjs <url> [outdir]')
  process.exit(2)
}

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

const evaluate = async (expression) => {
  const res = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  )
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text)
  return res.result.value
}

/*
 * Runs in the page. Elements are checked against the *viewport*, not against
 * their parent, because that's the overflow a user actually feels. `left < 0` is
 * counted too — an element hanging off the left edge is just as broken, and it
 * doesn't widen the scroll area, so nothing else would catch it.
 */
const AUDIT = `(() => {
  const scroller = document.getElementById('root') || document.documentElement
  const vw = scroller.clientWidth
  const offenders = []
  for (const el of document.querySelectorAll('body *')) {
    if (el === scroller) continue  // its own scrollbar is not an overflow
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    if (getComputedStyle(el).position === 'fixed') continue
    const over = Math.max(r.right - vw, -r.left)
    if (over > 1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        over: Math.round(over),
        left: Math.round(r.left),
        right: Math.round(r.right),
        cls: (el.getAttribute('class') || '').slice(0, 110),
        text: (el.textContent || '').trim().slice(0, 40),
      })
    }
  }
  const headings = [...document.querySelectorAll('h1, h2')].map((h) => ({
    tag: h.tagName.toLowerCase(),
    text: (h.textContent || '').trim().slice(0, 34),
    px: Math.round(parseFloat(getComputedStyle(h).fontSize)),
    lines: Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)),
    width: Math.round(h.getBoundingClientRect().width),
  }))
  // How wide each grid actually resolved to, which is the honest way to ask
  // whether the cards got cramped.
  const grids = [...document.querySelectorAll('[class*="grid-cols"]')].map((g) => ({
    cols: getComputedStyle(g).gridTemplateColumns.split(' ').map((c) => Math.round(parseFloat(c))).join('+'),
    gap: getComputedStyle(g).columnGap,
    text: (g.textContent || '').trim().slice(0, 28),
  }))
  return {
    vw,
    scrollWidth: scroller.scrollWidth,
    scrollHeight: scroller.scrollHeight,
    overflowX: scroller.scrollWidth - scroller.clientWidth,
    offenders: offenders.slice(0, 12),
    offenderCount: offenders.length,
    headings,
    grids,
  }
})()`

/** Poll until the page has actually rendered — Vite's first compile is slow. */
const READY = `document.querySelectorAll('h1, h2').length > 0`

let failed = 0
for (const vp of VIEWPORTS) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile },
    sessionId,
  )
  await send('Page.navigate', { url }, sessionId)

  for (let i = 0; i < 60; i++) {
    await sleep(400)
    try {
      if (await evaluate(READY)) break
    } catch {
      /* context still swapping */
    }
  }
  await sleep(2200) // the intro, the springs, and the web fonts

  const r = await evaluate(AUDIT)
  const ok = r.overflowX <= 0 && r.offenderCount === 0
  if (!ok) failed++

  console.log(`\n── ${vp.name} ${vp.w}×${vp.h} ${ok ? 'OK' : 'OVERFLOW'}`)
  console.log(
    `   scroller ${r.scrollWidth}w (client ${r.vw}) → overflowX ${r.overflowX}px, ` +
      `content ${r.scrollHeight}px tall`,
  )
  for (const h of r.headings) {
    console.log(`   ${h.tag} ${h.px}px ${h.lines} line(s) ${h.width}w  “${h.text}”`)
  }
  for (const g of r.grids) {
    console.log(`   grid [${g.cols}] gap ${g.gap}  “${g.text}”`)
  }
  if (r.offenderCount) {
    console.log(`   ${r.offenderCount} element(s) past the edge:`)
    for (const o of r.offenders) {
      console.log(`     ${o.tag} +${o.over}px [${o.left}..${o.right}] “${o.text}” .${o.cls}`)
    }
  }

  /*
   * One tall screenshot per viewport. `captureBeyondViewport` can't help here —
   * it extends the *document*, and the scrolling happens inside `#root` — so the
   * viewport is grown to the content height instead and the page re-measured at
   * that size. Capped, because a 20k-pixel-tall capture is its own problem.
   */
  await send(
    'Emulation.setDeviceMetricsOverride',
    {
      width: vp.w,
      height: Math.min(r.scrollHeight + 40, 8000),
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    },
    sessionId,
  )
  await sleep(900)
  const { data } = await send('Page.captureScreenshot', {}, sessionId)
  const file = `${outDir}/${vp.name}.png`
  writeFileSync(file, Buffer.from(data, 'base64'))
  console.log(`   → ${file}`)
}

ws.close()
console.log(failed ? `\n${failed} viewport(s) with overflow` : '\nno horizontal overflow at any viewport')
process.exit(failed ? 1 : 0)
