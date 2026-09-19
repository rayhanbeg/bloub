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
import { CHROME_SPRING, INTRO_DELAY, rise, useIntro } from '../animation/useIntro'
import { cn } from '../utils/cn'

/**
 * TypeScript note: `ComponentType<{ className?: string }>` means "any React
 * component that accepts a `className` prop" — so we can store the icon
 * components themselves in this array and render them below as `<Icon />`.
 */
const TABS: Array<{
  id: Tab
  label: string
  /** Shown beside the label in the rail's tooltip. An icon and a single noun
   *  say *what* a section is called; this says what's actually inside it. */
  hint: string
  Icon: ComponentType<{ className?: string }>
}> = [
  { id: 'style', label: 'Style', hint: 'shape, mood, colour', Icon: PaletteIcon },
  { id: 'presets', label: 'Presets', hint: 'ready-made Bloubs', Icon: GiftIcon },
  { id: 'settings', label: 'Settings', hint: 'motion and export', Icon: SlidersIcon },
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
  const { play } = useIntro()
  const bar = variant === 'bar'

  // Both forms join the intro; they differ only in which direction they arrive
  // from. The bar drops in from the top of the sheet it's pinned to; the rail
  // slides in from the edge it floats against.
  const entrance = bar
    ? rise(play, INTRO_DELAY.nav, -8)
    : {
        initial: play ? { opacity: 0, x: -10 } : false,
        animate: { opacity: 1, x: 0 },
        transition: {
          ...CHROME_SPRING,
          delay: INTRO_DELAY.nav,
          opacity: { duration: 0.42, delay: INTRO_DELAY.nav },
        },
      }

  return (
    <motion.nav
      aria-label="Sections"
      {...entrance}
      /*
       * The rail's vertical centring is a transform, and Framer Motion composes
       * the entire `transform` property itself from its own props — so a Tailwind
       * `-translate-y-1/2` here would simply be overwritten the moment `x`
       * animates, dropping the rail half its height down the stage. Handing the
       * offset to Framer as `translateY` instead puts it in the same transform
       * string as the `x` it's animating, where the two compose.
       */
      style={bar ? undefined : { translateY: '-50%' }}
      className={cn(
        bar
          ? // A segmented row inside the control sheet. Full-width on a phone,
            // but capped so it doesn't stretch into a banner on a tablet.
            'mx-auto flex w-full max-w-[420px] items-center gap-1 rounded-xl bg-zinc-100/80 p-1 lg:hidden'
          : // The floating card, vertically centred on the stage.
            'absolute left-5 top-1/2 z-10 hidden flex-col items-center gap-1 rounded-2xl bg-white p-1.5 shadow-[0_1px_2px_rgba(9,9,11,0.05),0_8px_24px_-8px_rgba(9,9,11,0.10)] ring-1 ring-zinc-950/[0.04] lg:flex',
      )}
    >
      {TABS.map(({ id, label, hint, Icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-label={label}
            aria-current={active}
            className={cn(
              /*
               * `focus-visible:` rather than `focus:` so the ring appears for
               * keyboard users and not on every mouse click. `outline-none` alone
               * was removing the focus indicator with nothing put back, which left
               * tabbing through the rail completely invisible.
               *
               * The pointer cursor is global, in `index.css` — Tailwind v4's
               * preflight sets `button { cursor: default }`, so it had to be put
               * back somewhere, and every button in the app wanted it.
               */
              'group relative flex items-center justify-center rounded-xl outline-none',
              'focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
              bar ? 'h-10 flex-1 gap-2' : 'h-10 w-10',
              // Something under the pointer before the click, so an inactive icon
              // reads as a target rather than as decoration.
              !active && (bar ? 'hover:bg-white/60' : 'hover:bg-zinc-100'),
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
                  : 'text-zinc-400 group-hover:text-zinc-700',
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
            {/*
              The rail's label, on hover or keyboard focus.
              This replaces the native `title` attribute, which waited about a
              second before saying anything and couldn't carry the hint. Rail-only:
              the bar prints its label already, and the rail is `lg:` and up, so
              there's no touch device to leave a sticky hover behind on.
            */}
            {!bar && (
              <span
                role="tooltip"
                className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-20 -translate-y-1/2 scale-95 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11.5px] font-medium text-white opacity-0 shadow-lg transition duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
              >
                {label} <span className="text-zinc-400">· {hint}</span>
              </span>
            )}
          </button>
        )
      })}
    </motion.nav>
  )
}
