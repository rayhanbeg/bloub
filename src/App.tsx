import { motion } from 'framer-motion'
import { BlobPreview } from './components/BlobPreview'
import { ControlPanel } from './components/ControlPanel'
import { ExportBar } from './components/ExportBar'
import { Sidebar } from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import { BlobProvider, useBlob } from './state/BlobProvider'
import { ENTRANCE_SPRING, INTRO_DELAY, rise, useIntro } from './animation/useIntro'

/**
 * The preview's box, as a single expression of width.
 *
 * The blob is always square, so sizing it is a one-dimensional problem — but it
 * has to lose to *both* axes: `vw` keeps it off the side edges on a narrow phone,
 * `dvh` keeps it from crowding out the export bar and the control sheet in a short
 * viewport. `min()` of the two is the whole rule.
 *
 * The desktop `dvh` share is deliberately generous (58%) rather than tight: it
 * exists only as a floor for genuinely short windows, and anything stingier would
 * quietly shrink the reference 392px preview on an ordinary laptop.
 */
const PREVIEW_BOX =
  'aspect-square w-[min(78vw,36dvh)] sm:w-[min(62vw,42dvh)] lg:w-[min(392px,58dvh)]'

// Keep the existing stage/canvas size; scale only the rendered character.
const CHARACTER_SCALE = 'origin-center scale-[0.85]'

function Workspace() {
  const { config, settings } = useBlob()
  const { play } = useIntro()

  return (
    // Mobile stacks: stage on top, controls underneath. From `lg:` up it's the
    // three-column desktop layout — rail, stage, panel.
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white text-zinc-900 lg:flex-row">
      <Sidebar />

      {/* The stage is white — the blob sits straight on the page, per the
          reference. A faint dot grid keeps the empty space from feeling flat. */}
      <main className="relative flex shrink-0 flex-col bg-white lg:min-w-0 lg:flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,rgba(9,9,11,0.055)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <motion.span
          {...rise(play, INTRO_DELAY.wordmark, -6)}
          className="absolute left-5 top-4 z-10 select-none text-[13px] font-semibold tracking-tight text-zinc-900 sm:left-6 sm:top-5"
        >
          Bloub
        </motion.span>

        {/* `lg:flex-1` only: on mobile the stage is auto-height, and a flex child
            with a zero basis in an auto-height column can collapse to nothing. */}
        <div className="relative flex items-center justify-center px-5 pb-2 pt-12 sm:px-8 sm:pt-14 lg:flex-1 lg:py-0">
          {/*
            The entrance: up from slightly smaller, with a spring soft enough to
            overshoot a hair before it settles. It's on this wrapper rather than
            on the svg, which already carries `CHARACTER_SCALE` — two elements,
            two transforms, nothing to conflict over.

            Opacity gets its own plain curve. On a spring it would overshoot past
            fully-opaque, which clamps to a flat spot and reads as a flicker.
          */}
          <motion.div
            initial={play ? { opacity: 0, scale: 0.84 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              ...ENTRANCE_SPRING,
              opacity: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
            }}
            className={PREVIEW_BOX}
          >
            <BlobPreview
              config={config}
              size="100%"
              idle={settings.idle}
              intro={play}
              className={CHARACTER_SCALE}
            />
          </motion.div>
        </div>

        <motion.div
          {...rise(play, INTRO_DELAY.exportBar)}
          className="relative flex justify-center pb-5 sm:pb-7 lg:pb-12"
        >
          <ExportBar />
        </motion.div>
      </main>

      <ControlPanel />
    </div>
  )
}

export default function App() {
  return (
    <BlobProvider>
      <ToastProvider>
        <Workspace />
      </ToastProvider>
    </BlobProvider>
  )
}
