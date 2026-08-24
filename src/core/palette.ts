/**
 * Curated colour palette.
 *
 * Black leads and is the default — a black blob on a white field is the app's
 * signature, and every other colour is an opt-in from there. The rest are
 * mid-tone and slightly desaturated so they read as considered rather than
 * default-primary.
 */

export interface Swatch {
  id: string
  label: string
  hex: string
}

export const PALETTE = [
  { id: 'ink', label: 'Ink', hex: '#111113' },
  { id: 'clay', label: 'Clay', hex: '#8c5a3c' },
  { id: 'coral', label: 'Coral', hex: '#e5484d' },
  { id: 'tangerine', label: 'Tangerine', hex: '#f76b15' },
  { id: 'amber', label: 'Amber', hex: '#ffb224' },
  { id: 'moss', label: 'Moss', hex: '#30a46c' },
  { id: 'teal', label: 'Teal', hex: '#12a594' },
  { id: 'sky', label: 'Sky', hex: '#0091ff' },
  { id: 'violet', label: 'Violet', hex: '#8e4ec6' },
  { id: 'rose', label: 'Rose', hex: '#d6409f' },
  { id: 'slate', label: 'Slate', hex: '#8b8d98' },
  { id: 'bone', label: 'Bone', hex: '#e8e4dd' },
] as const satisfies readonly Swatch[]

export type SwatchId = (typeof PALETTE)[number]['id']

/** The blob's colour on first load: black. */
export const DEFAULT_COLOR: string = PALETTE[0].hex
