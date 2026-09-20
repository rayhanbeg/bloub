import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { BlobPreview } from './BlobPreview'
import { navigate, ROUTES } from '../utils/navigation'
import type { BlobConfig } from '../core/types'
import { cn } from '../utils/cn'

const GITHUB = 'https://github.com/rayhanbeg/blouband'
const TWITTER = 'https://x.com/md_rayha_n'

/**
 * The hero character.
 *
 * `cloud` rather than `pebble`: at hero size the pebble reads as a rounded
 * square — a shape, not a creature — and the eyes look stuck onto a card. The
 * cloud's lobes give it a silhouette you recognise as a *body* before you find
 * the face, which is the whole point of a first impression.
 */
const HERO: BlobConfig = { shape: 'cloud', mood: 'curious', color: '#111113' }

/** The accent trio, reused by the showcase cards and the hero's colour wash so
 *  the page reads as one palette rather than four unrelated decisions. */
const ACCENT = { teal: '#12a594', red: '#e5484d', violet: '#8e4ec6' } as const

const showcase: Array<{ label: string; mood: string; config: BlobConfig; className: string }> = [
  { label: 'Cloud', mood: 'Curious', config: { shape: 'cloud', mood: 'curious', color: '#111113' }, className: 'rotate-[-7deg]' },
  { label: 'Pebble', mood: 'Happy', config: { shape: 'pebble', mood: 'happy', color: ACCENT.red }, className: 'rotate-[5deg]' },
  { label: 'Droplet', mood: 'Excited', config: { shape: 'droplet', mood: 'excited', color: ACCENT.teal }, className: 'rotate-[-3deg]' },
  { label: 'Squircle', mood: 'Thinking', config: { shape: 'squircle', mood: 'thinking', color: ACCENT.violet }, className: 'rotate-[6deg]' },
]

const features: Array<[string, string]> = [
  ['Customize', 'Choose a silhouette, tune the mood, and make a character that feels like yours.'],
  ['Export', 'Take it anywhere as a crisp SVG, high-resolution PNG, or expressive GIF.'],
  ['Open source', 'Inspect the details, make it your own, or help Bloub grow.'],
]

/* ------------------------------------------------------------------ buttons */

/**
 * One button, three skins.
 *
 * Every call-to-action on the page goes through this. Height, radius, press
 * feedback and focus ring can then no longer drift apart between sections —
 * which is precisely how a page ends up feeling unfinished even when each
 * individual piece looked fine on its own.
 *
 * TypeScript note: `ButtonTone` is a *union of string literals*, and typing the
 * lookup below as `Record<ButtonTone, string>` means adding a tone to the union
 * without adding its classes is a compile error rather than an `undefined`
 * className that silently renders an unstyled button.
 */
type ButtonTone = 'solid' | 'outline' | 'invert' | 'ghost'

const TONE: Record<ButtonTone, string> = {
  solid: 'bg-zinc-950 text-white shadow-[0_1px_2px_rgba(9,9,11,0.28)] hover:bg-zinc-800 focus-visible:ring-zinc-950',
  outline: 'border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 focus-visible:ring-zinc-950',
  invert: 'bg-white text-zinc-950 hover:bg-zinc-200 focus-visible:ring-white',
  // The dark section's secondary. `outline` can't be reused there — its white
  // fill makes it a near-twin of `invert`, and two solid white buttons side by
  // side give a reader no way to tell which one is the primary action.
  ghost: 'border border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 focus-visible:ring-white',
}

/*
 * Sized to their content at *every* width, so a phone gets the same pair of pills
 * a desktop does rather than two half-width slabs. They were stretched with
 * `flex-1` below `sm:` to guarantee they'd share a row; they don't need it —
 * "Create a Bloub →" and "GitHub" together measure well inside the 280px a 320px
 * phone leaves after padding, and the row never wraps because `ButtonRow` is
 * `flex-row` with no `flex-wrap`. The padding still steps down at `sm:` so the
 * labels keep their breathing room on the narrowest screens.
 */
const BUTTON_BASE = cn(
  'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full',
  'px-4 text-[13px] font-semibold tracking-[-0.01em] whitespace-nowrap sm:px-6 sm:text-[13.5px]',
  'transition-[background-color,border-color,transform,box-shadow] duration-200',
  'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
)

function ButtonLink({
  href,
  to,
  tone = 'solid',
  offset = 'focus-visible:ring-offset-[#fcfcfb]',
  children,
}: {
  href?: string
  /** An internal route. Mutually exclusive with `href` in practice. */
  to?: string
  tone?: ButtonTone
  /**
   * The ring-offset class, so the focus halo sits on the real background rather
   * than on white. It has to arrive as a complete literal: Tailwind generates
   * utilities by scanning source text, so a class assembled at runtime from
   * fragments would never be emitted.
   */
  offset?: 'focus-visible:ring-offset-[#fcfcfb]' | 'focus-visible:ring-offset-zinc-950'
  children: ReactNode
}) {
  const className = cn(BUTTON_BASE, TONE[tone], offset)
  if (to) {
    return (
      <a
        href={to}
        onClick={(event) => {
          event.preventDefault()
          navigate(to)
        }}
        className={className}
      >
        {children}
      </a>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  )
}

/** A pair of buttons that stays a row at every width — never a column. */
function ButtonRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-row items-center gap-2.5 sm:gap-3', className)}>{children}</div>
}

/* -------------------------------------------------------------------- bits */

function InternalLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault()
        navigate(to)
      }}
      className={className}
    >
      {children}
    </a>
  )
}

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.5a9.5 9.5 0 0 0-3 18.51c.48.09.65-.21.65-.46v-1.67c-2.65.58-3.21-1.13-3.21-1.13-.43-1.1-1.06-1.4-1.06-1.4-.86-.59.07-.58.07-.58.95.07 1.45.98 1.45.98.85 1.45 2.22 1.03 2.76.79.08-.61.33-1.03.6-1.27-2.12-.24-4.35-1.06-4.35-4.72 0-1.04.37-1.89.98-2.56-.1-.24-.43-1.21.09-2.52 0 0 .8-.26 2.62.98a9.11 9.11 0 0 1 4.77 0c1.82-1.24 2.62-.98 2.62-.98.52 1.31.19 2.28.1 2.52.61.67.98 1.52.98 2.56 0 3.67-2.24 4.47-4.37 4.7.34.3.65.89.65 1.8v2.68c0 .25.17.56.66.46A9.5 9.5 0 0 0 12 2.5Z" />
    </svg>
  )
}

const eyebrow = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500'
/** Every section shares one vertical rhythm instead of each picking its own. */
const shell = 'mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10'

/* -------------------------------------------------------------------- page */

export function LandingPage() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const previous = root.style.overflow
    root.style.overflow = 'auto'
    return () => {
      root.style.overflow = previous
    }
  }, [])

  return (
    // `overflow-x-clip` rather than `overflow-hidden`: it pins the one axis that
    // must never scroll without turning this into a scroll container, which would
    // fight the `#root` scroller the effect above just opened up. `clip` also
    // leaves the sticky header resolving against `#root`, which `hidden` wouldn't.
    <div className="min-h-dvh overflow-x-clip bg-[#fcfcfb] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-950/[0.06] bg-[#fcfcfb]/85 backdrop-blur-xl">
        <div className={cn(shell, 'flex h-16 items-center justify-between')}>
          <InternalLink
            to={ROUTES.home}
            className="rounded-lg text-[15px] font-semibold tracking-[-0.04em] outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcfcfb]"
          >
            Bloub
          </InternalLink>
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {/* Text links get real padding so they're a 40px tap target rather
                than a 14px-tall strip of text. */}
            <InternalLink
              to={ROUTES.editor}
              className="rounded-full px-3 py-2 text-[13px] font-medium text-zinc-600 outline-none transition-colors hover:bg-zinc-950/[0.04] hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              Editor
            </InternalLink>
            <InternalLink
              to={ROUTES.settings}
              className="rounded-full px-3 py-2 text-[13px] font-medium text-zinc-600 outline-none transition-colors hover:bg-zinc-950/[0.04] hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              Settings
            </InternalLink>
            {/* Icon-only on a phone, icon + word from `sm:` — so the GitHub link
                survives on mobile instead of being hidden outright. */}
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              aria-label="Bloub on GitHub"
              className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-zinc-600 outline-none transition-colors hover:bg-zinc-950/[0.04] hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 sm:px-3"
            >
              <GithubMark className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------------ hero */}
        <section className={cn(shell, 'grid items-center gap-12 pb-20 pt-12 sm:gap-14 sm:pb-28 sm:pt-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:pb-36 lg:pt-24')}>
          <div className="relative z-[1] max-w-xl">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className={eyebrow}>
              Open-source blob avatar generator
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06 }}
              className="mt-5 text-balance text-[clamp(2.75rem,8.4vw,6.4rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-zinc-950"
            >
              Make a little world of Bloubs.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="mt-6 max-w-md text-[16px] leading-relaxed text-zinc-600 sm:mt-7 sm:text-[17px]"
            >
              Shape a character, find its mood, then export it as SVG, PNG, or a looping GIF. Bloub is a tiny creative
              tool, built in the open.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <ButtonRow className="mt-8">
                <ButtonLink to={ROUTES.editor}>
                  Create a Bloub <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink href={GITHUB} tone="outline">
                  <GithubMark className="h-4 w-4 shrink-0" /> GitHub
                </ButtonLink>
              </ButtonRow>
            </motion.div>
          </div>

          {/* The stage. Three soft colour blooms in the page's own accent trio,
              a hairline ring to give the space an edge, and a ground shadow that
              deliberately does *not* float with the character — that contrast is
              what sells the drift as weight rather than as a sliding layer. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 110, damping: 20, delay: 0.08 }}
            className="relative mx-auto aspect-square w-full max-w-[400px] sm:max-w-[470px] lg:max-w-[540px]"
          >
            <div aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute left-[4%] top-[8%] h-[52%] w-[52%] rounded-full blur-[54px]" style={{ backgroundColor: ACCENT.teal, opacity: 0.28 }} />
              <div className="absolute right-[2%] top-[18%] h-[50%] w-[50%] rounded-full blur-[58px]" style={{ backgroundColor: ACCENT.red, opacity: 0.24 }} />
              <div className="absolute bottom-[4%] left-[22%] h-[50%] w-[56%] rounded-full blur-[62px]" style={{ backgroundColor: ACCENT.violet, opacity: 0.24 }} />
            </div>
            <div aria-hidden className="absolute inset-0 rounded-full ring-1 ring-inset ring-zinc-950/[0.06]" />
            <div aria-hidden className="absolute bottom-[9%] left-1/2 h-[4%] w-[42%] -translate-x-1/2 rounded-[50%] bg-zinc-950/15 blur-[16px]" />

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
              // Inset from the ring. The stage's edge is a circle inscribed in a
              // square, and the cloud's widest lobes sit at exactly the height
              // where that circle is widest — at `w-full` the two collide and the
              // character looks jammed into its own frame rather than placed in it.
              className="relative z-[1] h-full w-full p-[7%]"
            >
              {/*
                Curious, not Excited. The mismatched eye heights are the most
                expressive thing in the whole set — they read as a face still
                adjusting to what it's looking at, which is the right first
                impression, and they pair well with the cursor tracking: an eye
                that's already peering has somewhere to peer *at*.
              */}
              <BlobPreview config={HERO} size="100%" follow />
            </motion.div>

            <span className="absolute bottom-[8%] right-[2%] z-[2] inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-zinc-600 shadow-[0_4px_16px_-8px_rgba(9,9,11,0.4)] backdrop-blur">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT.teal }} />
              alive, a little
            </span>
          </motion.div>
        </section>

        {/* -------------------------------------------------------- features */}
        <section className="border-y border-zinc-200/80 bg-white">
          {/* One column on a phone, three from `sm:` up. The dividers swap axis
              with the layout: a rule under each stacked row, a rule to the right
              of each column. `[&:not(:last-child)]` is Tailwind's
              arbitrary-variant syntax — the bare `not(:last-child):` this used to
              carry compiled to nothing, so the desktop columns had no separators. */}
          <div className={cn(shell, 'grid sm:grid-cols-3')}>
            {features.map(([title, description], index) => (
              <div
                key={title}
                className="group border-zinc-200/80 py-8 transition-colors [&:not(:last-child)]:border-b sm:px-7 sm:py-12 sm:first:pl-0 sm:last:pr-0 sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r"
              >
                <span className="inline-flex h-6 items-center rounded-full bg-zinc-100 px-2 text-[10.5px] font-semibold tabular-nums tracking-[0.08em] text-zinc-500 transition-colors group-hover:bg-zinc-950 group-hover:text-white">
                  0{index + 1}
                </span>
                <h2 className="mt-4 text-[17px] font-semibold tracking-[-0.035em]">{title}</h2>
                <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-zinc-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- showcase */}
        <section className={cn(shell, 'py-20 sm:py-28')}>
          {/* The header goes side-by-side only at `lg:`. At 768 the heading
              already wraps to two lines, and putting the paragraph beside it
              squeezed both — stacked, they each get the full column. */}
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className={eyebrow}>A small cast</p>
              <h2 className="mt-3 text-[clamp(1.9rem,7vw,3rem)] font-semibold tracking-[-0.06em]">Same soul, different energy.</h2>
            </div>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-zinc-600">
              Eight shapes and a whole shelf of moods, all made with the same tiny visual language.
            </p>
          </div>
          {/* Two columns until `lg:`, four after. Four across a tablet measured
              161px per card — *narrower* than the same card at 375px, since the
              wider padding eats what the extra width gave — so the phone layout
              is the better one right up to the desktop breakpoint. */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {showcase.map(({ label, mood, config, className }) => (
              <motion.div
                key={label}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="group rounded-[1.75rem] border border-zinc-200/90 bg-white p-3 pb-4 shadow-[0_1px_2px_rgba(9,9,11,0.04),0_18px_36px_-28px_rgba(9,9,11,0.5)] transition-[border-color,box-shadow] duration-300 hover:border-zinc-300 hover:shadow-[0_1px_2px_rgba(9,9,11,0.05),0_26px_48px_-28px_rgba(9,9,11,0.55)] sm:p-5 sm:pb-6"
              >
                {/*
                  The square wrapper is load-bearing, not decoration. Grid items
                  stretch to their row's height, which hands the card a *definite*
                  height — and `size="100%"` then resolves the svg's height against
                  that and swallows the entire box, pushing both labels out below
                  the card's own background. Deriving the height from the width
                  with `aspect-square` makes it independent of the row.
                */}
                <div className="aspect-square w-full">
                  <BlobPreview config={config} size="100%" idle={false} className={cn('h-full w-full transition-transform duration-300 group-hover:rotate-0', className)} />
                </div>
                {/* Shape and mood on separate lines: the label is what the card is
                    demonstrating, so it shouldn't be one long run-on string at
                    11px on a 134px-wide phone card. */}
                <div className="mt-2.5 text-center">
                  <p className="text-[12px] font-semibold tracking-[-0.02em] text-zinc-900">{label}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-500">{mood}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------- cta */}
        <section className="border-t border-zinc-200/80 bg-zinc-950 text-white">
          <div className={cn(shell, 'grid gap-9 py-16 sm:py-28 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12')}>
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Create · Customize · Export</p>
              {/* Clamped for the same reason as the hero's — at 320px a fixed
                  48px broke "Built in the open." across three lines. */}
              <h2 className="mt-4 text-[clamp(2.35rem,9vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.06em]">Built in the open.</h2>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-zinc-300">
                Bloub is an open-source creative playground. Explore the code, shape it to your needs, or simply make a
                character that makes you smile.
              </p>
            </div>
            {/* Two buttons here rather than one: the section's own heading is
                about the project, but the page's job is still to get you into the
                editor, and a dead-end dark band was leaving that on the table. */}
            <ButtonRow className="lg:shrink-0">
              <ButtonLink href={GITHUB} tone="invert" offset="focus-visible:ring-offset-zinc-950">
                <GithubMark className="h-4 w-4 shrink-0" /> GitHub
              </ButtonLink>
              <ButtonLink to={ROUTES.editor} tone="ghost" offset="focus-visible:ring-offset-zinc-950">
                Open editor <span aria-hidden>→</span>
              </ButtonLink>
            </ButtonRow>
          </div>
        </section>
      </main>

      {/* A row at every width — at 320px "Developed by Rayhan" and the two links
          together measure well under the available 280px, so stacking them only
          ever added height without buying legibility. */}
      <footer className="bg-zinc-950 text-zinc-400">
        <div className={cn(shell, 'flex flex-row items-center justify-between gap-4 border-t border-white/10 py-6 text-[11.5px]')}>
          <span>Developed by Rayhan</span>
          <div className="flex shrink-0 items-center gap-x-4">
            <a href={GITHUB} target="_blank" rel="noreferrer" className="rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              GitHub
            </a>
            <a href={TWITTER} target="_blank" rel="noreferrer" className="rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
