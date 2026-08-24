/**
 * Left icon rail — a floating card, vertically centred, three destinations.
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
const TABS: Array<{ id: Tab; label: string; Icon: ComponentType<{ className?: string }> }> = [
  { id: 'style', label: 'Style', Icon: PaletteIcon },
  { id: 'presets', label: 'Presets', Icon: GiftIcon },
  { id: 'settings', label: 'Settings', Icon: SlidersIcon },
]

export function Sidebar() {
  const { tab, setTab } = useBlob()

  return (
    <nav
      aria-label="Sections"
      className="absolute left-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1 rounded-2xl bg-white p-1.5 shadow-[0_1px_2px_rgba(9,9,11,0.05),0_8px_24px_-8px_rgba(9,9,11,0.10)] ring-1 ring-zinc-950/[0.04]"
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
            className="relative flex h-10 w-10 items-center justify-center rounded-xl outline-none"
          >
            {active && (
              <motion.span
                layoutId="rail-active"
                transition={{ type: 'spring', stiffness: 540, damping: 40, mass: 0.6 }}
                className="absolute inset-0 rounded-xl bg-zinc-900"
              />
            )}
            <Icon
              className={cn(
                'relative h-[18px] w-[18px] transition-colors duration-150',
                active ? 'text-white' : 'text-zinc-400 hover:text-zinc-700',
              )}
            />
          </button>
        )
      })}
    </nav>
  )
}
