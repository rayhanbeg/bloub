import { BlobPreview } from './components/BlobPreview'
import { ControlPanel } from './components/ControlPanel'
import { ExportBar } from './components/ExportBar'
import { Sidebar } from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import { BlobProvider, useBlob } from './state/BlobProvider'

function Workspace() {
  const { config, settings } = useBlob()

  return (
    <div className="flex h-full w-full overflow-hidden bg-white text-zinc-900">
      <Sidebar />

      {/* The stage is white — the blob sits straight on the page, per the
          reference. A faint dot grid keeps the empty space from feeling flat. */}
      <main className="relative flex min-w-0 flex-1 flex-col bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,rgba(9,9,11,0.055)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <span className="absolute left-6 top-5 z-10 select-none text-[13px] font-semibold tracking-tight text-zinc-900">
          bloub
        </span>

        <div className="relative flex flex-1 items-center justify-center px-8">
          <BlobPreview config={config} size={392} idle={settings.idle} />
        </div>

        <div className="relative flex justify-center pb-12">
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
