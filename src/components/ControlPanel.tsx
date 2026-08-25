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

import { motion } from 'framer-motion'
import { ColourPicker } from './ColourPicker'
import { MoodPicker } from './MoodPicker'
import { ShapePicker } from './ShapePicker'
import { PresetPicker } from './PresetPicker'
import { SettingsPanel } from './SettingsPanel'
import { Sidebar } from './Sidebar'
import { isFirstPaint, SECTION_SEQUENCE } from '../animation/useIntro'
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

      {/*
        Orchestrates the sections' staggered entrance and nothing else: the
        variants it names carry no styles of its own, and `display: contents`
        keeps it out of the layout entirely, so the sections remain direct
        children of the scrolling column.

        `initial` is a live question, not a flag from mount: switching tabs
        remounts these sections and Framer Motion reads `initial` at each mount.
        Asking `isFirstPaint()` here means the intro's sections are hidden and
        staggered, while the sections behind a tab the user clicked are simply
        there. Reading it at mount instead — this component's own mount, which
        happened during the intro — would replay the whole stagger, delay and all,
        every time a tab was switched.
      */}
      <motion.div
        variants={SECTION_SEQUENCE}
        initial={isFirstPaint() ? 'hidden' : false}
        animate="shown"
        className="contents"
      >
        {tab === 'style' && (
          <>
            <ShapePicker />
            <MoodPicker />
            <ColourPicker />
          </>
        )}
        {tab === 'presets' && <PresetPicker />}
        {tab === 'settings' && <SettingsPanel />}
      </motion.div>

      {/* Breathing room past the last section on touch, plus the iOS home-bar
          inset so the final row of swatches is never under it. */}
      <div className="h-[max(0.5rem,env(safe-area-inset-bottom))] shrink-0 lg:hidden" />
    </aside>
  )
}
