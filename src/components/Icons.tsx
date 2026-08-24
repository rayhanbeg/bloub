/**
 * Hand-rolled line icons. 24px grid, 1.6 stroke, `currentColor` — no icon
 * library, and no icon that isn't actually used.
 */

interface IconProps {
  className?: string
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function PaletteIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 4.2-4.4 4.2h-1.7a1.6 1.6 0 0 0-1.1 2.7c.3.4.4.8.4 1.2A1.7 1.7 0 0 1 12 21Z" />
      <circle cx="8.4" cy="8" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="13" cy="6.9" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="16.8" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="7" cy="13" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1.2" />
      <path d="M12 8v13M19.2 12v6.8A2.2 2.2 0 0 1 17 21H7a2.2 2.2 0 0 1-2.2-2.2V12" />
      <path d="M7.6 8a2.5 2.5 0 0 1 0-5C10.4 3 12 8 12 8s1.6-5 4.4-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h9M17 18h3" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="18" r="2" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m6 9.5 6 5.5 6-5.5" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.1} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 17v1.5A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 2-2V17" />
    </svg>
  )
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2.2" />
      <path d="M15 5.8A2.3 2.3 0 0 0 12.7 3.5H5.8A2.3 2.3 0 0 0 3.5 5.8v6.9A2.3 2.3 0 0 0 5.8 15" />
    </svg>
  )
}

export function ShuffleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M16 4.5h4v4M20 4.5 4 20.5M4 4.5l5.5 5.5M14.5 15.5 20 20.5m0 0h-4m4 0v-4" />
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5M12 15.8v.2" />
    </svg>
  )
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10.2 9.2 15 12l-4.8 2.8V9.2Z" />
    </svg>
  )
}

export function FilmIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="M8.2 5.5v13M15.8 5.5v13M3.5 12h17" />
    </svg>
  )
}
