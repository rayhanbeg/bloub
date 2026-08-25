/**
 * ExportBar — the primary action beneath the preview, plus the six-option menu.
 *
 * The bar owns no export logic. Every item calls one function from
 * `utils/export`, which always resolves to `{ ok, message }`, and the only thing
 * that happens here is a toast. That split is why an export can be exercised
 * without the UI at all.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useBlob } from '../state/BlobProvider'
import { useToast } from './Toast'
import { EXPORT_ACTIONS } from '../utils/export'
import type { ExportResult } from '../utils/export'
import { ChevronDownIcon, CopyIcon, DownloadIcon, FilmIcon, PlayIcon } from './Icons'
import { cn } from '../utils/cn'
import type { ComponentType } from 'react'

type ActionId = keyof typeof EXPORT_ACTIONS

interface MenuItem {
  id: ActionId
  label: string
  Icon: ComponentType<{ className?: string }>
  /** Shown while the action runs. GIF encoding is the only slow one. */
  busyLabel?: string
}

const ITEMS: readonly MenuItem[] = [
  { id: 'png', label: 'Download PNG', Icon: DownloadIcon },
  { id: 'svg', label: 'Download SVG', Icon: DownloadIcon },
  { id: 'animatedSvg', label: 'Download animated SVG', Icon: PlayIcon },
  { id: 'gif', label: 'Download animated GIF', Icon: FilmIcon, busyLabel: 'Encoding…' },
  { id: 'copyImage', label: 'Copy image', Icon: CopyIcon },
  { id: 'copySvg', label: 'Copy SVG', Icon: CopyIcon },
]

export function ExportBar() {
  const { config, settings } = useBlob()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<ActionId | null>(null)
  const [progress, setProgress] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on click-outside and on Escape. `pointerdown` rather than `click` so
  // the menu is gone before the click lands on whatever is underneath.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const run = useCallback(
    async (id: ActionId) => {
      if (busy) return
      // Close first: a menu that lingers through a two-second GIF encode reads
      // as a stuck click.
      setOpen(false)
      setBusy(id)
      setProgress(0)
      try {
        const result: ExportResult =
          id === 'gif'
            ? await EXPORT_ACTIONS.gif(config, settings, { onProgress: setProgress })
            : await EXPORT_ACTIONS[id](config, settings)
        toast(result.message, result.ok ? 'ok' : 'error')
      } catch (error) {
        // The actions catch their own failures; this is the belt-and-braces case
        // where something outside them throws.
        toast(error instanceof Error ? error.message : 'That export failed.', 'error')
      } finally {
        setBusy(null)
        setProgress(0)
      }
    },
    [busy, config, settings, toast],
  )

  const gifBusy = busy === 'gif'
  const primaryLabel =
    busy === 'png' ? 'Exporting…' : gifBusy ? `Encoding ${Math.round(progress * 100)}%` : 'Export as PNG'

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-stretch overflow-hidden rounded-[10px] bg-white ring-1 ring-zinc-950/[0.07] shadow-[0_1px_2px_rgba(9,9,11,0.05),0_6px_16px_-8px_rgba(9,9,11,0.12)]">
        <button
          type="button"
          onClick={() => run('png')}
          disabled={busy !== null}
          className="h-10 px-4 text-[13px] font-medium tracking-tight text-zinc-900 outline-none transition-colors duration-150 hover:bg-zinc-50 disabled:opacity-60 sm:h-9 sm:text-[12.5px]"
        >
          {primaryLabel}
        </button>
        <span className="my-1.5 w-px bg-zinc-200" />
        <button
          type="button"
          title="More export options"
          aria-label="More export options"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          className="flex w-10 items-center justify-center text-zinc-500 outline-none transition-colors duration-150 hover:bg-zinc-50 hover:text-zinc-900 sm:w-8"
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 34,
              mass: 0.6,
            }}
            className="flex"
          >
            <ChevronDownIcon className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.985 }}
            transition={{
              type: 'spring',
              stiffness: 520,
              damping: 38,
              mass: 0.6,
            }}
            style={{ transformOrigin: 'bottom center' }}
            // The menu is centred on the button and opens upward. Its width is
            // capped against the viewport rather than fixed, so on a narrow phone
            // it narrows instead of running off the edge — the button always sits
            // near the horizontal centre, so a viewport-wide cap is enough to keep
            // both edges on screen without measuring anything.
            className="absolute bottom-[calc(100%+8px)] left-1/2 w-[min(244px,calc(100vw-28px))] -translate-x-1/2 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-zinc-950/[0.07] shadow-[0_1px_2px_rgba(9,9,11,0.06),0_12px_32px_-12px_rgba(9,9,11,0.22)]"
          >
            {ITEMS.map(({ id, label, Icon, busyLabel }) => {
              const running = busy === id
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitem"
                  disabled={busy !== null}
                  onClick={() => run(id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[13px] tracking-tight outline-none transition-colors duration-100',
                    'sm:py-[7px] sm:text-[12.5px]',
                    'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50',
                  )}
                >
                  <Icon className="h-[15px] w-[15px] shrink-0 text-zinc-400" />
                  <span className="truncate">{running && busyLabel ? busyLabel : label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
