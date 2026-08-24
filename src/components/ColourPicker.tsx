/**
 * ColourPicker — a 6-column grid of large round swatches plus a custom well.
 */

import { useId } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../core/palette'
import { useBlob } from '../state/BlobProvider'
import { Section } from './Panel'
import { cn } from '../utils/cn'

const isPreset = (hex: string): boolean =>
  PALETTE.some((s) => s.hex.toLowerCase() === hex.toLowerCase())

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
      <div className="grid grid-cols-6 gap-x-2 gap-y-3 pt-0.5">
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
              className="group relative mx-auto flex h-8 w-8 items-center justify-center rounded-full outline-none"
            >
              {selected && <SwatchRing />}
              <span
                className={cn(
                  'block h-8 w-8 rounded-full ring-1 ring-inset ring-black/[0.08]',
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
          className="group relative mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full outline-none"
        >
          {custom && <SwatchRing />}
          <span
            className={cn(
              'pointer-events-none flex h-8 w-8 items-center justify-center rounded-full',
              'transition-transform duration-200 ease-out',
              custom
                ? 'ring-1 ring-inset ring-black/[0.08]'
                : 'ring-1 ring-zinc-300 group-hover:scale-[1.08]',
            )}
            style={custom ? { backgroundColor: config.color } : undefined}
          >
            {!custom && (
              <svg viewBox="0 0 14 14" className="h-3 w-3 text-zinc-400">
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
