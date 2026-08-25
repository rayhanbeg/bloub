/**
 * ShapePicker — body silhouettes, each wearing the neutral face so the grid reads
 * as a row of characters rather than abstract blobs.
 */

import { useMemo } from 'react'
import { generateBlobSvg, TILE_SCALE } from '../core/generateBlob'
import { SHAPES } from '../shapes'
import { useBlob } from '../state/BlobProvider'
import { Grid, Section, Tile } from './Panel'

const TILE_INK = '#111113'

function ShapeThumb({ shape }: { shape: string }) {
  const markup = useMemo(
    () =>
      generateBlobSvg(
        { shape, mood: 'neutral', color: TILE_INK },
        { size: '100%', scale: TILE_SCALE.body, features: '#ffffff' },
      ),
    [shape],
  )
  return (
    <span
      className="absolute inset-0 block [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      // Markup comes from our own pure generator over a fixed set of ids — no
      // user-authored string ever reaches this.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export function ShapePicker() {
  const { config, setShape } = useBlob()

  return (
    <Section title="Shape">
      <Grid className="[--tile-min:76px] lg:[--tile-min:62px]">
        {SHAPES.map((shape) => (
          <Tile
            key={shape.id}
            label={shape.label}
            group="shape"
            selected={config.shape === shape.id}
            onSelect={() => setShape(shape.id)}
          >
            <ShapeThumb shape={shape.id} />
          </Tile>
        ))}
      </Grid>
    </Section>
  )
}
