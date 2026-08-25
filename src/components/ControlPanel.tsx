/**
 * The control surface. One section stack per tab, always scrollable.
 *
 * Two layouts, one component: from `lg:` up it's the fixed-width bordered aside
 * on the right of the stage; below that it's a full-width sheet under the preview
 * that takes whatever height is left over (`flex-1 min-h-0`) and scrolls inside
 * itself. `min-h-0` is the part that's easy to miss — without it a flex child
 * refuses to shrink below its content, and the sheet would push the preview off
 * the top of the screen instead of scrolling.
 */

import { ColourPicker } from './ColourPicker'
import { MoodPicker } from './MoodPicker'
import { ShapePicker } from './ShapePicker'
import { PresetPicker } from './PresetPicker'
import { SettingsPanel } from './SettingsPanel'
import { Sidebar } from './Sidebar'
import { useBlob } from '../state/BlobProvider'

export function ControlPanel() {
  const { tab } = useBlob()

  return (
    <aside className="scroll-slim flex min-h-0 w-full flex-1 flex-col overflow-y-auto border-t border-zinc-200/80 bg-white lg:h-full lg:w-[312px] lg:flex-none lg:border-l lg:border-t-0 lg:pt-6">
      {/* Mobile-only tab bar; the desktop rail lives on the stage instead. It
          sticks so the sections can be switched without scrolling back up. */}
      <div className="sticky top-0 z-20 bg-white/90 px-5 pb-3 pt-3 backdrop-blur-sm lg:hidden">
        <Sidebar variant="bar" />
      </div>

      {tab === 'style' && (
        <>
          <ShapePicker />
          <MoodPicker />
          <ColourPicker />
        </>
      )}
      {tab === 'presets' && <PresetPicker />}
      {tab === 'settings' && <SettingsPanel />}

      {/* Breathing room past the last section on touch, plus the iOS home-bar
          inset so the final row of swatches is never under it. */}
      <div className="h-[max(0.5rem,env(safe-area-inset-bottom))] shrink-0 lg:hidden" />
    </aside>
  )
}
