/**
 * The export system.
 *
 * Six actions, one shape each: `(config, settings) => Promise<ExportResult>`.
 * The UI's only job is to call one and show the message it gets back — every
 * failure mode is caught here and turned into a sentence a person can read.
 *
 * **Exports are generated, not screen-scraped.** An earlier version serialised
 * the live `<svg>` node, which sounds like the most faithful thing possible and
 * isn't: the blob is always mid-breath and possibly mid-blink, so two clicks a
 * second apart produced visibly different files. Everything here goes through
 * `generateBlobSvg`, the same pure function the picker tiles use, evaluated at
 * rest. Deterministic, and identical to the blob at the top of its breath.
 */

import { generateBlobSvg, VIEWBOX } from '../core/generateBlob'
import { generateAnimatedSvg } from '../core/animatedSvg'
import { animateFace } from '../core/face'
import { exportBlinkAt, idleAt, idleTransform } from '../core/idle'
import { luminance } from '../core/geometry'
import { moodFace, moodMotion } from '../moods'
import type { BlobConfig } from '../core/types'

/** Result type shared by every export action, so the UI can toast uniformly. */
export interface ExportResult {
  ok: boolean
  message: string
}

/**
 * Everything the Settings panel can change about an export.
 *
 * TypeScript note: an `interface` here rather than a `type` because this is a
 * plain object shape that other code may want to extend later.
 */
export interface ExportSettings {
  /** Base drawing size in px. The PNG comes out at `size × scale`. */
  size: number
  /** Pixel multiplier for the PNG and the clipboard image. */
  scale: number
  /** Transparent background for the PNG and SVG exports. */
  transparent: boolean
  /** GIF pixel size. GIFs are the one export where size really costs bytes. */
  gifSize: number
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  size: 512,
  scale: 3,
  transparent: true,
  gifSize: 512,
}

/** `bloub-happy-pebble.png` */
export function exportFilename(config: BlobConfig, ext: string): string {
  return `bloub-${config.mood}-${config.shape}.${ext}`
}

const background = (settings: ExportSettings): string | null =>
  settings.transparent ? null : '#ffffff'

/* ------------------------------------------------------------- primitives */

/** SVG markup → data URL. Data URLs (unlike blob URLs) never taint a canvas. */
export function svgToDataUrl(markup: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
}

/** Load SVG markup into an `<img>` so it can be drawn onto a canvas. */
export function loadSvgImage(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('The browser could not rasterise this SVG.'))
    img.src = svgToDataUrl(markup)
  })
}

/**
 * Rasterise SVG markup at exactly `pixels` square.
 *
 * The markup is asked for at the *final* pixel size rather than being drawn
 * small and scaled up on the canvas — that way the browser rasterises the vector
 * once, at full resolution, and there is no interpolation anywhere in the chain.
 */
async function rasterize(markup: string, pixels: number, fill?: string): Promise<HTMLCanvasElement> {
  const img = await loadSvgImage(markup)

  const canvas = document.createElement('canvas')
  canvas.width = pixels
  canvas.height = pixels
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is unavailable in this browser.')

  if (fill) {
    ctx.fillStyle = fill
    ctx.fillRect(0, 0, pixels, pixels)
  }
  ctx.drawImage(img, 0, 0, pixels, pixels)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Image encoding failed.'))
    }, type)
  })
}

/* ---------------------------------------------------------------- markup */

/** The still blob, at rest, as standalone SVG markup. */
export function staticSvg(config: BlobConfig, settings: ExportSettings, pixels?: number): string {
  return generateBlobSvg(config, {
    size: pixels ?? settings.size,
    background: background(settings),
    pretty: true,
  })
}

/** The self-animating blob as standalone SVG markup. */
export function animatedSvg(config: BlobConfig, settings: ExportSettings): string {
  return generateAnimatedSvg(config, {
    size: settings.size,
    background: background(settings),
  })
}

/** The still blob as a PNG blob, transparent unless settings say otherwise. */
export async function pngBlob(config: BlobConfig, settings: ExportSettings): Promise<Blob> {
  const pixels = Math.round(settings.size * settings.scale)
  const canvas = await rasterize(staticSvg(config, settings, pixels), pixels)
  return canvasToBlob(canvas)
}

/* ------------------------------------------------------------------- gif */

/**
 * How many frames one loop gets.
 *
 * Aiming at roughly 14fps: fast enough that breathing is smooth, slow enough
 * that a 4-second loop doesn't run to 100 frames. Clamped at both ends so a
 * 1.7-second Excited loop still gets enough frames to be smooth and a 7.5-second
 * Sleepy loop doesn't produce a megabyte.
 */
function gifFrameCount(loopPeriod: number): number {
  return Math.min(Math.max(Math.round(loopPeriod * 14), 24), 56)
}

/**
 * A GIF is opaque by design.
 *
 * GIF transparency is a single index, not an alpha channel, so keying a colour
 * out leaves a hard fringe wherever the blob was antialiased against it. A flat
 * background looks dramatically better, and white matches the app — except for a
 * near-white blob, which would vanish, so that case gets a soft grey instead.
 */
function gifBackground(color: string): string {
  return luminance(color) > 0.88 ? '#e4e4e7' : '#ffffff'
}

export interface GifOptions {
  /** Called with 0–1 as frames are drawn and then encoded. */
  onProgress?: (ratio: number) => void
}

/**
 * Encode one seamless loop of the idle animation as an animated GIF.
 *
 * Each frame is the pure generator evaluated at one phase — the body transform
 * baked in via {@link idleTransform}, the blink and gaze baked into the face by
 * {@link animateFace}. Because every oscillator in `idleAt` is an integer
 * harmonic of the phase, frame N lands exactly where frame 0 started and the
 * loop needs no crossfade.
 */
export async function gifBlob(
  config: BlobConfig,
  settings: ExportSettings,
  { onProgress }: GifOptions = {},
): Promise<Blob> {
  // Loaded on demand: gif.js and its worker are ~40kB that most sessions never
  // touch, and a failure to load shouldn't break the other five exports.
  const [{ default: GIF }, { default: workerScript }] = await Promise.all([
    import('gif.js'),
    import('gif.js/dist/gif.worker.js?url'),
  ])

  const motion = moodMotion(config.mood)
  const face = moodFace(config.mood)
  const frames = gifFrameCount(motion.loopPeriod)
  const pixels = settings.gifSize
  const fill = gifBackground(config.color)

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: pixels,
    height: pixels,
    workerScript,
    repeat: 0, // loop forever
    background: fill,
    transparent: null,
  })

  for (let i = 0; i < frames; i++) {
    const phase = i / frames
    const state = idleAt(phase, motion)
    const markup = generateBlobSvg(config, {
      size: pixels,
      background: fill,
      face: animateFace(face, exportBlinkAt(phase, motion), state.gazeX, state.gazeY),
      transform: idleTransform(state),
    })
    const canvas = await rasterize(markup, pixels, fill)
    // `copy: true` because gif.js reads the pixels lazily otherwise, and this
    // canvas is thrown away on the next iteration.
    gif.addFrame(canvas, { delay: Math.round((motion.loopPeriod * 1000) / frames), copy: true })
    onProgress?.((i / frames) * 0.5)
  }

  return new Promise<Blob>((resolve, reject) => {
    gif.on('progress', (ratio) => onProgress?.(0.5 + ratio * 0.5))
    gif.on('finished', (blob) => {
      if (blob.size > 0) resolve(blob)
      else reject(new Error('GIF encoding produced an empty file.'))
    })
    gif.on('abort', () => reject(new Error('GIF encoding was aborted.')))
    gif.render()
  })
}

/* ----------------------------------------------------------------- output */

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on a later tick — Safari needs the URL to outlive the click.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(text: string, filename: string, type: string): void {
  downloadBlob(new Blob([text], { type }), filename)
}

/** Human-readable size for a toast: `184 KB`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* -------------------------------------------------------------- clipboard */

/**
 * Copy text, preferring the async Clipboard API.
 *
 * The `execCommand` fallback matters more than it looks: `navigator.clipboard`
 * is undefined on any page not served over HTTPS or localhost, which includes
 * opening a built `index.html` straight off disk.
 */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '-1000px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const copied = document.execCommand('copy')
  area.remove()
  if (!copied) throw new Error('This browser blocked clipboard access.')
}

/**
 * Copy a PNG to the clipboard.
 *
 * `ClipboardItem` is handed the *promise*, not the resolved blob. Safari only
 * allows a clipboard write during the gesture that triggered it, and awaiting
 * the encode first spends that gesture; passing the promise lets the write
 * start immediately and settle later.
 */
export async function copyImage(config: BlobConfig, settings: ExportSettings): Promise<void> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    throw new Error('This browser cannot copy images. Try Chrome, Edge or Safari.')
  }
  const item = new ClipboardItem({ 'image/png': pngBlob(config, settings) })
  await navigator.clipboard.write([item])
}

/* ------------------------------------------------------------------ actions */

/** Wrap an action so every thrown value becomes a readable message. */
async function attempt(
  run: () => Promise<string>,
  fallback: string,
): Promise<ExportResult> {
  try {
    return { ok: true, message: await run() }
  } catch (error) {
    const detail = error instanceof Error && error.message ? error.message : fallback
    return { ok: false, message: detail }
  }
}

export const EXPORT_ACTIONS = {
  png: (config: BlobConfig, settings: ExportSettings) =>
    attempt(async () => {
      const blob = await pngBlob(config, settings)
      downloadBlob(blob, exportFilename(config, 'png'))
      const pixels = Math.round(settings.size * settings.scale)
      return `PNG saved · ${pixels}×${pixels} · ${formatBytes(blob.size)}`
    }, 'Could not export a PNG.'),

  svg: (config: BlobConfig, settings: ExportSettings) =>
    attempt(async () => {
      const markup = staticSvg(config, settings)
      downloadText(markup, exportFilename(config, 'svg'), 'image/svg+xml')
      return `SVG saved · ${formatBytes(new Blob([markup]).size)}`
    }, 'Could not export an SVG.'),

  animatedSvg: (config: BlobConfig, settings: ExportSettings) =>
    attempt(async () => {
      const markup = animatedSvg(config, settings)
      downloadText(markup, exportFilename(config, 'animated.svg'), 'image/svg+xml')
      return `Animated SVG saved · ${formatBytes(new Blob([markup]).size)}`
    }, 'Could not export an animated SVG.'),

  gif: (config: BlobConfig, settings: ExportSettings, options?: GifOptions) =>
    attempt(async () => {
      const blob = await gifBlob(config, settings, options)
      downloadBlob(blob, exportFilename(config, 'gif'))
      return `GIF saved · ${settings.gifSize}px · ${formatBytes(blob.size)}`
    }, 'Could not encode a GIF.'),

  copyImage: (config: BlobConfig, settings: ExportSettings) =>
    attempt(async () => {
      await copyImage(config, settings)
      return 'Image copied to clipboard'
    }, 'Could not copy the image.'),

  copySvg: (config: BlobConfig, settings: ExportSettings) =>
    attempt(async () => {
      await copyText(staticSvg(config, settings))
      return 'SVG markup copied to clipboard'
    }, 'Could not copy the SVG.'),
}

/** The viewBox every export shares, re-exported for probes and tests. */
export { VIEWBOX }
