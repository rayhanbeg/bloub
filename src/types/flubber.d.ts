/**
 * Type declarations for `flubber`, which ships no types of its own.
 *
 * Only the surface bloub actually uses is declared — narrower is better here,
 * because anything declared is something the compiler will stop checking.
 */

declare module 'flubber' {
  export interface InterpolateOptions {
    /**
     * Maximum length of a resampled segment, in user units. Smaller values give
     * a smoother morph at the cost of a longer path string.
     */
    maxSegmentLength?: number
    /** Return a path string (default true) rather than an array of points. */
    string?: boolean
  }

  /** Returns a function from progress (0–1) to an SVG path string. */
  export function interpolate(
    fromShape: string,
    toShape: string,
    options?: InterpolateOptions,
  ): (t: number) => string
}
