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
  { value: 256, label: 'S' },
  { value: 512, label: 'M' },
  { value: 720, label: 'L' },
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
        <Divider />
        <div className="pt-4">
          <div className="text-[12.5px] font-medium tracking-tight text-zinc-800">Developed by Rayhan</div>
          <div className="mt-2 space-y-1.5 text-[11.5px] leading-snug">
            <a
              href="https://github.com/rayhanbeg/bloub"
              target="_blank"
              rel="noreferrer"
              className="block w-fit text-zinc-500 transition-colors hover:text-zinc-900"
            >
              GitHub <span className="text-zinc-700">@rayhanbeg/bloub</span>
            </a>
            <a
              href="https://www.instagram.com/md_rayha_n/"
              target="_blank"
              rel="noreferrer"
              className="block w-fit text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Instagram <span className="text-zinc-700">@md_rayha_n</span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}
