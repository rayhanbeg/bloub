/**
 * MoodPicker — faces on black circles, matching the reference: the expression is
 * what varies, so the body is held constant. The grid reflows to as many columns
 * as the panel is wide, which matters here more than anywhere else — this is the
 * longest list in the app.
 */

import { useMemo } from 'react'
import { generateBlobSvg, TILE_SCALE } from '../core/generateBlob'
import { MOODS } from '../moods'
import { useBlob } from '../state/BlobProvider'
import { Grid, Section, Tile } from './Panel'

const TILE_INK = '#111113'

function MoodThumb({ mood }: { mood: string }) {
  const markup = useMemo(
    () =>
      generateBlobSvg(
        { shape: 'circle', mood, color: TILE_INK },
        { size: '100%', scale: TILE_SCALE.body, features: '#ffffff' },
      ),
    [mood],
  )
  return (
    <span
      className="absolute inset-0 block [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export function MoodPicker() {
  const { config, setMood } = useBlob()

  return (
    <Section title="Mood">
      <Grid className="[--tile-min:76px] lg:[--tile-min:62px]">
        {MOODS.map((mood) => (
          <Tile
            key={mood.id}
            label={mood.label}
            group="mood"
            selected={config.mood === mood.id}
            onSelect={() => setMood(mood.id)}
          >
            <MoodThumb mood={mood.id} />
          </Tile>
        ))}
      </Grid>
    </Section>
  )
}
