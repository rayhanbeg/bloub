/**
 * Right-hand control panel. Scrollable; one section stack per tab.
 */

import { ColourPicker } from './ColourPicker'
import { MoodPicker } from './MoodPicker'
import { ShapePicker } from './ShapePicker'
import { PresetPicker } from './PresetPicker'
import { SettingsPanel } from './SettingsPanel'
import { useBlob } from '../state/BlobProvider'

export function ControlPanel() {
  const { tab } = useBlob()

  return (
    <aside className="scroll-slim w-[312px] shrink-0 overflow-y-auto border-l border-zinc-200/80 bg-white pt-6">
      {tab === 'style' && (
        <>
          <ShapePicker />
          <MoodPicker />
          <ColourPicker />
        </>
      )}
      {tab === 'presets' && <PresetPicker />}
      {tab === 'settings' && <SettingsPanel />}
    </aside>
  )
}
