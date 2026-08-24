/**
 * SettingsPanel — the small number of choices that actually change something.
 *
 * Everything here feeds either the preview loop or the export pipeline; there is
 * no setting that exists only to look configurable.
 */

import { useBlob } from '../state/BlobProvider'
import { Choice, Divider, Row, Section, Toggle } from './Panel'

const SCALES = [
  { value: 2, label: '2×' },
  { value: 3, label: '3×' },
  { value: 4, label: '4×' },
] as const

const GIF_SIZES = [
  { value: 200, label: 'S' },
  { value: 256, label: 'M' },
  { value: 360, label: 'L' },
] as const

export function SettingsPanel() {
  const { settings, updateSettings } = useBlob()
  const pixels = Math.round(settings.size * settings.scale)

  return (
    <Section title="Settings">
      <div className="-mt-1.5">
        <Row label="Idle animation" hint="Breathing, blinking and wobble in the preview.">
          <Toggle
            label="Idle animation"
            checked={settings.idle}
            onChange={(idle) => updateSettings({ idle })}
          />
        </Row>
        <Divider />
        <Row label="PNG resolution" hint={`Exports at ${pixels}×${pixels} pixels.`}>
          <Choice
            label="PNG resolution"
            value={settings.scale}
            options={SCALES}
            onChange={(scale) => updateSettings({ scale })}
          />
        </Row>
        <Divider />
        <Row
          label="Transparent background"
          hint="Applies to PNG and SVG. GIF is always drawn on a flat colour."
        >
          <Toggle
            label="Transparent background"
            checked={settings.transparent}
            onChange={(transparent) => updateSettings({ transparent })}
          />
        </Row>
        <Divider />
        <Row label="GIF size" hint={`${settings.gifSize}px square. Smaller means fewer bytes.`}>
          <Choice
            label="GIF size"
            value={settings.gifSize}
            options={GIF_SIZES}
            onChange={(gifSize) => updateSettings({ gifSize })}
          />
        </Row>
      </div>
    </Section>
  )
}
