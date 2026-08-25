/**
 * Shared control-panel primitives: section headings, option grids, and the
 * selectable tile that shape/mood cards are built from.
 */

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'

export function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="px-5 pb-6 sm:px-6 sm:pb-7">
      <div className="mb-3 flex h-5 items-center justify-between">
        <h2 className="text-[13.5px] font-semibold tracking-[-0.01em] text-zinc-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/**
 * A responsive option grid.
 *
 * The column count is deliberately *not* a number anywhere in this file.
 * `auto-fill` + `minmax(--tile-min, 1fr)` asks the browser to fit as many columns
 * as the container can hold at its current width, which is what stops the grids
 * from either overflowing on a phone or squeezing 39 moods into tiles too small
 * to tap. Callers set `--tile-min` per breakpoint — larger on small screens so
 * tiles stay finger-sized, smaller in the 312px desktop aside so it still reads
 * as a tidy 4-up sheet.
 */
export function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid gap-x-1 gap-y-3',
        '[grid-template-columns:repeat(auto-fill,minmax(var(--tile-min,62px),1fr))]',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface TileProps {
  selected: boolean
  label: string
  /** Tiles sharing a group animate one selection outline between them. */
  group: string
  onSelect: () => void
  children: ReactNode
}

/**
 * One selectable card: an unframed preview with a label underneath.
 *
 * There is no tile background — the blob sits straight on the panel, so the grid
 * reads as a sheet of specimens rather than a wall of buttons. Selection is a
 * single hairline outline that *glides* between tiles via a shared `layoutId`,
 * rather than blinking off here and on over there.
 */
export function Tile({ selected, label, group, onSelect, children }: TileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={label}
      className="group relative flex flex-col items-center gap-2 rounded-xl px-1 pb-1 pt-2 outline-none"
    >
      {selected && (
        <motion.span
          layoutId={`ring-${group}`}
          transition={{ type: 'spring', stiffness: 560, damping: 44, mass: 0.6 }}
          className="pointer-events-none absolute inset-0 rounded-xl ring-[1.5px] ring-inset ring-zinc-900"
        />
      )}
      <span
        className={cn(
          'relative block aspect-square w-full',
          'transition-transform duration-200 ease-out',
          selected ? 'scale-100' : 'group-hover:scale-[1.06] group-active:scale-95',
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          'w-full truncate text-center text-[11px] leading-none transition-colors duration-150',
          selected ? 'font-medium text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-800',
        )}
      >
        {label}
      </span>
    </button>
  )
}

/* ------------------------------------------------------- settings controls */

/** A labelled row: name and optional hint on the left, control on the right. */
export function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium tracking-tight text-zinc-800">{label}</div>
        {hint && <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-500">{hint}</p>}
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  )
}

/** A hairline between setting rows. */
export function Divider() {
  return <div className="h-px bg-zinc-200/80" />
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative rounded-full outline-none transition-colors duration-200',
        // Bigger on touch, back to the compact desktop pill from `sm:` up. The
        // knob inset is 2px at both sizes, so one pair of offsets covers both.
        'h-6 w-11 sm:h-[22px] sm:w-[38px]',
        checked ? 'bg-zinc-900' : 'bg-zinc-200',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 620, damping: 40, mass: 0.5 }}
        className={cn(
          'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_2px_rgba(9,9,11,0.18)] sm:h-[18px] sm:w-[18px]',
          checked ? 'right-[2px]' : 'left-[2px]',
        )}
      />
    </button>
  )
}

/**
 * A small segmented control.
 *
 * TypeScript note: `<T extends string | number>` makes this generic over the
 * value type, so `<Choice value={3} options={[…]} />` keeps `onChange` typed as
 * `(next: number) => void` rather than widening to `string`.
 */
export function Choice<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (next: T) => void
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className="relative rounded-[6px] px-3 py-1.5 text-[12px] font-medium tabular-nums outline-none sm:px-2 sm:py-1 sm:text-[11.5px]"
          >
            {selected && (
              <motion.span
                layoutId={`choice-${label}`}
                transition={{
                  type: 'spring',
                  stiffness: 620,
                  damping: 42,
                  mass: 0.5,
                }}
                className="absolute inset-0 rounded-[6px] bg-white shadow-[0_1px_2px_rgba(9,9,11,0.10)]"
              />
            )}
            <span className={cn('relative', selected ? 'text-zinc-900' : 'text-zinc-500')}>
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
