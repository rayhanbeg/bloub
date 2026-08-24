/**
 * Presets — curated shape · mood · colour combinations.
 *
 * These exist because the three pickers are independent, and independence means
 * most random combinations are merely valid rather than good. A preset is an
 * opinion: this shape suits this expression at this colour.
 */

import type { BlobConfig } from './types'

export interface Preset {
  id: string
  label: string
  config: BlobConfig
}

export const PRESETS = [
  { id: 'ink', label: 'Ink', config: { shape: 'pebble', mood: 'neutral', color: '#111113' } },
  { id: 'sunny', label: 'Sunny', config: { shape: 'circle', mood: 'happy', color: '#ffb224' } },
  { id: 'giggle', label: 'Giggle', config: { shape: 'cloud', mood: 'laughing', color: '#f76b15' } },
  { id: 'crush', label: 'Crush', config: { shape: 'pebble', mood: 'lovestruck', color: '#d6409f' } },
  { id: 'nap', label: 'Nap', config: { shape: 'capsule', mood: 'sleepy', color: '#8b8d98' } },
  { id: 'smug', label: 'Smug', config: { shape: 'squircle', mood: 'smug', color: '#0091ff' } },
  { id: 'plot', label: 'Plot', config: { shape: 'triangle', mood: 'sneaky', color: '#8e4ec6' } },
  { id: 'focus', label: 'Focus', config: { shape: 'hexagon', mood: 'determined', color: '#12a594' } },
  { id: 'fizz', label: 'Fizz', config: { shape: 'droplet', mood: 'excited', color: '#30a46c' } },
  { id: 'huh', label: 'Huh', config: { shape: 'cloud', mood: 'confused', color: '#e8e4dd' } },
  { id: 'grump', label: 'Grump', config: { shape: 'squircle', mood: 'angry', color: '#e5484d' } },
  { id: 'sigh', label: 'Sigh', config: { shape: 'droplet', mood: 'sad', color: '#8c5a3c' } },
] as const satisfies readonly Preset[]

export type PresetId = (typeof PRESETS)[number]['id']

/** Does the current config match a preset exactly? */
export function matchPreset(config: BlobConfig): Preset | undefined {
  return PRESETS.find(
    (p) =>
      p.config.shape === config.shape &&
      p.config.mood === config.mood &&
      p.config.color.toLowerCase() === config.color.toLowerCase(),
  )
}
