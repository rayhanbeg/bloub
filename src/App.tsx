import { BlobPreview } from './components/BlobPreview'
import { ControlPanel } from './components/ControlPanel'
import { ExportBar } from './components/ExportBar'
import { Sidebar } from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import { BlobProvider, useBlob } from './state/BlobProvider'

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

function Workspace() {
  const { config, settings } = useBlob()

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
        <span className="absolute left-5 top-4 z-10 select-none text-[13px] font-semibold tracking-tight text-zinc-900 sm:left-6 sm:top-5">
          bloub
        </span>

        {/* `lg:flex-1` only: on mobile the stage is auto-height, and a flex child
            with a zero basis in an auto-height column can collapse to nothing. */}
        <div className="relative flex items-center justify-center px-5 pb-2 pt-12 sm:px-8 sm:pt-14 lg:flex-1 lg:py-0">
          <div className={PREVIEW_BOX}>
            <BlobPreview config={config} size="100%" idle={settings.idle} />
          </div>
        </div>

        <div className="relative flex justify-center pb-5 sm:pb-7 lg:pb-12">
          <ExportBar />
        </div>
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
