/**
 * The section switcher, in two forms.
 *
 * Desktop keeps the floating vertical rail on the left of the stage. On anything
 * narrower the stage is full-width and there is no left margin to float in, so
 * the same three destinations become a horizontal tab bar pinned to the top of
 * the control sheet — where a thumb can actually reach them, and where they sit
 * directly above the controls they switch.
 *
 * Both forms are mounted at once (one is `hidden` at any given width), which is
 * why the sliding pill's `layoutId` is namespaced per variant: two live elements
 * sharing one `layoutId` would make Framer Motion try to animate the pill between
 * a visible rail and a `display: none` bar.
 */

import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { GiftIcon, PaletteIcon, SlidersIcon } from './Icons'
import { useBlob } from '../state/BlobProvider'
import type { Tab } from '../state/BlobProvider'
import { cn } from '../utils/cn'

/**
 * TypeScript note: `ComponentType<{ className?: string }>` means "any React
 * component that accepts a `className` prop" — so we can store the icon
 * components themselves in this array and render them below as `<Icon />`.
 */
const TABS: Array<{
  id: Tab
  label: string
  Icon: ComponentType<{ className?: string }>
}> = [
  { id: 'style', label: 'Style', Icon: PaletteIcon },
  { id: 'presets', label: 'Presets', Icon: GiftIcon },
  { id: 'settings', label: 'Settings', Icon: SlidersIcon },
]

/**
 * TypeScript note: `'rail' | 'bar'` is a *union of literal types* — the prop
 * accepts those two exact strings and nothing else, so a typo is a compile error
 * rather than a silently dead branch.
 */
export interface SidebarProps {
  variant?: 'rail' | 'bar'
}

export function Sidebar({ variant = 'rail' }: SidebarProps) {
  const { tab, setTab } = useBlob()
  const bar = variant === 'bar'

  return (
    <nav
      aria-label="Sections"
      className={cn(
        bar
          ? // A segmented row inside the control sheet. Full-width on a phone,
            // but capped so it doesn't stretch into a banner on a tablet.
            'mx-auto flex w-full max-w-[420px] items-center gap-1 rounded-xl bg-zinc-100/80 p-1 lg:hidden'
          : // The floating card, vertically centred on the stage.
            'absolute left-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-2xl bg-white p-1.5 shadow-[0_1px_2px_rgba(9,9,11,0.05),0_8px_24px_-8px_rgba(9,9,11,0.10)] ring-1 ring-zinc-950/[0.04] lg:flex',
      )}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            title={label}
            aria-label={label}
            aria-current={active}
            className={cn(
              'relative flex items-center justify-center rounded-xl outline-none',
              bar ? 'h-10 flex-1 gap-2' : 'h-10 w-10',
            )}
          >
            {active && (
              <motion.span
                layoutId={`rail-active-${variant}`}
                transition={{
                  type: 'spring',
                  stiffness: 540,
                  damping: 40,
                  mass: 0.6,
                }}
                className={cn(
                  'absolute inset-0 rounded-xl',
                  bar
                    ? 'bg-white shadow-[0_1px_2px_rgba(9,9,11,0.08)] ring-1 ring-zinc-950/[0.04]'
                    : 'bg-zinc-900',
                )}
              />
            )}
            <Icon
              className={cn(
                'relative h-[18px] w-[18px] shrink-0 transition-colors duration-150',
                active
                  ? bar
                    ? 'text-zinc-900'
                    : 'text-white'
                  : 'text-zinc-400 hover:text-zinc-700',
              )}
            />
            {/* The rail has room only for an icon; the bar has room for a word,
                so it uses one. */}
            {bar && (
              <span
                className={cn(
                  'relative text-[12.5px] font-medium tracking-tight transition-colors duration-150',
                  active ? 'text-zinc-900' : 'text-zinc-500',
                )}
              >
                {label}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
