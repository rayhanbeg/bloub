/**
 * Type declarations for `gif.js`, which ships no types of its own.
 *
 * Only the surface bloub actually uses is declared. The library is a CommonJS
 * UMD bundle, so the constructor arrives as the default export.
 */

declare module 'gif.js' {
  export interface GifOptions {
    /** Encoder web workers. 2 is a good balance for a ~40-frame loop. */
    workers?: number
    /** 1 (best, slow) to 30 (worst, fast). 10 is the library default. */
    quality?: number
    width?: number
    height?: number
    /** URL of `gif.worker.js`. Vite gives us this via a `?url` import. */
    workerScript?: string
    /** 0 = loop forever, -1 = play once, n = repeat n times. */
    repeat?: number
    background?: string
    /** A 0xRRGGBB colour to treat as transparent, or null for opaque. */
    transparent?: number | null
    dither?: boolean | string
    debug?: boolean
  }

  export interface FrameOptions {
    /** Frame duration in milliseconds. */
    delay?: number
    /** Copy the pixels now — required when reusing one canvas for every frame. */
    copy?: boolean
    dispose?: number
  }

  export default class GIF {
    constructor(options?: GifOptions)
    addFrame(
      source: CanvasImageSource | ImageData | CanvasRenderingContext2D,
      options?: FrameOptions,
    ): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'progress', callback: (ratio: number) => void): void
    on(event: 'abort' | 'start', callback: () => void): void
    render(): void
    abort(): void
  }
}
