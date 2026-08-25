/**
 * ColourPicker — a reflowing grid of large round swatches plus a custom well.
 *
 * Same `auto-fill` trick as the tile grids: the swatches are a fixed size and the
 * *cells* stretch, so on a phone you get fewer, roomier columns instead of a row
 * of dots too small to hit.
 */

import { useId } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../core/palette'
import { useBlob } from '../state/BlobProvider'
import { Section } from './Panel'
import { cn } from '../utils/cn'

const isPreset = (hex: string): boolean =>
  PALETTE.some((s) => s.hex.toLowerCase() === hex.toLowerCase())

/** Swatch size, mobile then desktop. Shared by the presets and the custom well
 *  so the ring lines up on both. */
const SWATCH = 'h-9 w-9 lg:h-8 lg:w-8'

/** The dark hairline that marks the active swatch, with a gap so the colour
 *  underneath is still legible. Shared `layoutId` so it slides between swatches. */
function SwatchRing() {
  return (
    <motion.span
      layoutId="swatch-ring"
      transition={{ type: 'spring', stiffness: 580, damping: 44, mass: 0.55 }}
      className="pointer-events-none absolute -inset-[3px] rounded-full ring-[1.5px] ring-zinc-900"
    />
  )
}

export function ColourPicker() {
  const { config, setColor } = useBlob()
  const inputId = useId()
  const custom = !isPreset(config.color)

  return (
    <Section title="Colour">
      <div className="grid gap-x-2 gap-y-3 pt-0.5 [--swatch-min:44px] [grid-template-columns:repeat(auto-fill,minmax(var(--swatch-min),1fr))] lg:[--swatch-min:36px]">
        {PALETTE.map((swatch) => {
          const selected = swatch.hex.toLowerCase() === config.color.toLowerCase()
          return (
            <button
              key={swatch.id}
              type="button"
              title={swatch.label}
              aria-label={swatch.label}
              aria-pressed={selected}
              onClick={() => setColor(swatch.hex)}
              className={cn(
                'group relative mx-auto flex items-center justify-center rounded-full outline-none',
                SWATCH,
              )}
            >
              {selected && <SwatchRing />}
              <span
                className={cn(
                  'block rounded-full ring-1 ring-inset ring-black/[0.08]',
                  SWATCH,
                  'transition-transform duration-200 ease-out',
                  selected ? 'scale-100' : 'group-hover:scale-[1.08] group-active:scale-95',
                )}
                style={{ backgroundColor: swatch.hex }}
              />
            </button>
          )
        })}

        {/* Custom colour. The native input is stretched invisibly over the well
            so the whole circle is the hit target. */}
        <label
          htmlFor={inputId}
          title="Custom colour"
          className={cn(
            'group relative mx-auto flex cursor-pointer items-center justify-center rounded-full outline-none',
            SWATCH,
          )}
        >
          {custom && <SwatchRing />}
          <span
            className={cn(
              'pointer-events-none flex items-center justify-center rounded-full',
              SWATCH,
              'transition-transform duration-200 ease-out',
              custom
                ? 'ring-1 ring-inset ring-black/[0.08]'
                : 'ring-1 ring-zinc-300 group-hover:scale-[1.08]',
            )}
            style={custom ? { backgroundColor: config.color } : undefined}
          >
            {!custom && (
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-zinc-400 lg:h-3 lg:w-3">
                <path
                  d="M7 2.5v9M2.5 7h9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            )}
          </span>
          <input
            id={inputId}
            type="color"
            value={config.color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 h-full w-full opacity-0"
            aria-label="Custom colour"
          />
        </label>
      </div>
    </Section>
  )
}
