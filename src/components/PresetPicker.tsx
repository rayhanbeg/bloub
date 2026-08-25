/**
 * PresetPicker — curated shape · mood · colour combinations.
 *
 * Bigger tiles than the shape and mood grids because a preset is a whole
 * finished blob rather than one ingredient, and it deserves to be seen as one.
 * How many fit on a row is the grid's business, not this file's.
 */

import { useMemo } from 'react'
import { generateBlobSvg, TILE_SCALE } from '../core/generateBlob'
import { PRESETS, matchPreset } from '../core/presets'
import { useBlob } from '../state/BlobProvider'
import { Grid, Section, Tile } from './Panel'
import { ShuffleIcon } from './Icons'
import type { BlobConfig } from '../core/types'

function PresetThumb({ config }: { config: BlobConfig }) {
  const markup = useMemo(
    () => generateBlobSvg(config, { size: '100%', scale: TILE_SCALE.body }),
    [config],
  )
  return (
    <span
      // Safe: this markup comes from our own pure generator, never from input.
      className="absolute inset-0 block [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export function PresetPicker() {
  const { config, setConfig, shuffle } = useBlob()
  const active = matchPreset(config)

  return (
    <Section
      title="Presets"
      action={
        <button
          type="button"
          onClick={shuffle}
          title="Shuffle"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium text-zinc-500 outline-none transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 sm:px-2 sm:py-1"
        >
          <ShuffleIcon className="h-3.5 w-3.5" />
          Shuffle
        </button>
      }
    >
      {/* Wider minimum than the ingredient grids — a preset is a finished blob,
          so it gets a bigger cell at every width. */}
      <Grid className="[--tile-min:96px] lg:[--tile-min:80px]">
        {PRESETS.map((preset) => (
          <Tile
            key={preset.id}
            label={preset.label}
            group="preset"
            selected={active?.id === preset.id}
            onSelect={() => setConfig({ ...preset.config })}
          >
            <PresetThumb config={preset.config} />
          </Tile>
        ))}
      </Grid>
    </Section>
  )
}
