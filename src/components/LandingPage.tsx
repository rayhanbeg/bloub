import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { BlobPreview } from './BlobPreview'
import { navigate, ROUTES } from '../utils/navigation'
import type { BlobConfig } from '../core/types'

const GITHUB = 'https://github.com/rayhanbeg/blouband'
const INSTAGRAM = 'https://www.instagram.com/md_rayha_n/'

const showcase: Array<{ label: string; config: BlobConfig; className: string }> = [
  { label: 'Curious cloud', config: { shape: 'cloud', mood: 'curious', color: '#111113' }, className: 'rotate-[-7deg]' },
  { label: 'Happy pebble', config: { shape: 'pebble', mood: 'happy', color: '#e5484d' }, className: 'rotate-[5deg]' },
  { label: 'Excited droplet', config: { shape: 'droplet', mood: 'excited', color: '#12a594' }, className: 'rotate-[-3deg]' },
  { label: 'Thinking squircle', config: { shape: 'squircle', mood: 'thinking', color: '#8e4ec6' }, className: 'rotate-[6deg]' },
]

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

const sectionTitle = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500'

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
    // fight the `#root` scroller the effect above just opened up.
    <div className="min-h-dvh overflow-x-clip bg-[#fcfcfb] text-zinc-900">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <InternalLink to={ROUTES.home} className="text-[15px] font-semibold tracking-[-0.04em]">Bloub</InternalLink>
        <nav aria-label="Main navigation" className="flex items-center gap-4 text-[12px] font-medium text-zinc-500 sm:gap-6">
          <InternalLink to={ROUTES.editor} className="transition-colors hover:text-zinc-950">Editor</InternalLink>
          <InternalLink to={ROUTES.settings} className="transition-colors hover:text-zinc-950">Settings</InternalLink>
          <a href={GITHUB} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 transition-colors hover:text-zinc-950 sm:flex">
            <GithubMark className="h-3.5 w-3.5" /> GitHub
          </a>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:px-10 lg:pb-36 lg:pt-24">
          <div className="relative z-[1] max-w-xl">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className={sectionTitle}>
              Open-source blob avatar generator
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.06 }} className="mt-5 text-balance text-[clamp(2.75rem,8.4vw,6.4rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-zinc-950">
              Make a little world of Bloubs.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }} className="mt-7 max-w-md text-[16px] leading-relaxed text-zinc-600 sm:text-[17px]">
              Shape a character, find its mood, then export it as SVG, PNG, or a looping GIF. Bloub is a tiny creative tool, built in the open.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 flex flex-wrap items-center gap-3">
              <InternalLink to={ROUTES.editor} className="rounded-full bg-zinc-950 px-5 py-3 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5">Create a Bloub <span aria-hidden>→</span></InternalLink>
              <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-[13px] font-semibold text-zinc-800 transition-colors hover:border-zinc-400">
                <GithubMark className="h-4 w-4" /> View on GitHub
              </a>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 110, damping: 20, delay: 0.08 }} className="relative mx-auto aspect-square w-full max-w-[480px]">
            <div aria-hidden className="absolute inset-[6%] rounded-full border border-dashed border-zinc-200" />
            <div aria-hidden className="absolute inset-[18%] rounded-full bg-zinc-100" />
            <BlobPreview config={{ shape: 'pebble', mood: 'excited', color: '#111113' }} size="100%" follow className="relative z-[1]" />
            <span className="absolute bottom-[10%] right-[2%] rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-600 shadow-sm">alive, a little</span>
          </motion.div>
        </section>

        <section className="border-y border-zinc-200/80 bg-white">
          {/* One column on a phone, three from `sm:` up. The dividers swap axis with
              the layout: a rule under each stacked row, a rule to the right of each
              column. `[&:not(:last-child)]` is Tailwind's arbitrary-variant syntax —
              the bare `not(:last-child):` this used to carry compiled to nothing at
              all, so the desktop columns had no separators. */}
          <div className="mx-auto grid max-w-6xl px-5 sm:grid-cols-3 sm:px-8 lg:px-10">
            {[
              ['Customize', 'Choose a silhouette, tune the mood, and make a character that feels like yours.'],
              ['Export', 'Take it anywhere as a crisp SVG, high-resolution PNG, or expressive GIF.'],
              ['Open source', 'Inspect the details, make it your own, or help Bloub grow.'],
            ].map(([title, description], index) => (
              <div key={title} className="border-zinc-200/80 py-8 [&:not(:last-child)]:border-b sm:px-7 sm:py-11 sm:first:pl-0 sm:last:pr-0 sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r">
                <span className="text-[11px] font-semibold tabular-nums text-zinc-400">0{index + 1}</span>
                <h2 className="mt-4 text-lg font-semibold tracking-[-0.035em]">{title}</h2>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-zinc-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          {/* The header goes side-by-side only at `lg:`. At 768 the heading
              already wraps to two lines, and putting the paragraph beside it
              squeezed both — stacked, they each get the full column. */}
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div><p className={sectionTitle}>A small cast</p><h2 className="mt-3 text-[clamp(1.9rem,7vw,3rem)] font-semibold tracking-[-0.06em]">Same soul, different energy.</h2></div>
            <p className="max-w-xs text-[13px] leading-relaxed text-zinc-600">Eight shapes and a whole shelf of moods, all made with the same tiny visual language.</p>
          </div>
          {/* Two columns until `lg:`, four after. Four across a tablet measured
              161px per card — *narrower* than the same card at 375px, since the
              wider padding eats what the extra width gave — so the phone layout
              is the better one right up to the desktop breakpoint. */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {showcase.map(({ label, config, className }) => (
              <motion.div key={label} whileHover={{ y: -6, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="group rounded-[1.8rem] border border-zinc-200 bg-white p-3 shadow-[0_12px_30px_-24px_rgba(9,9,11,0.55)] sm:p-5">
                <BlobPreview config={config} size="100%" idle={false} className={className} />
                <p className="mt-2 text-center text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-900">{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-200/80 bg-zinc-950 text-white">
          {/* `gap-8` on a phone rather than `gap-12`: stacked, the button reads as
              belonging to the paragraph above it, and 48px of air made it look
              stranded. The heading is a clamp for the same reason as the hero's —
              at 320px a fixed 48px broke "Built in the open." across three lines. */}
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-28 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 lg:px-10">
            <div className="max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Create · Customize · Export</p><h2 className="mt-4 text-[clamp(2.35rem,9vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.06em]">Built in the open.</h2><p className="mt-5 max-w-lg text-[15px] leading-relaxed text-zinc-300">Bloub is an open-source creative playground. Explore the code, shape it to your needs, or simply make a character that makes you smile.</p></div>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-semibold text-zinc-950 transition-transform hover:-translate-y-0.5"><GithubMark className="h-4 w-4" /> View on GitHub</a>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 text-zinc-400"><div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-white/10 px-5 py-6 text-[11.5px] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><span>Developed by Rayhan</span><div className="flex flex-wrap gap-x-4 gap-y-1"><a href={GITHUB} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a><a href={INSTAGRAM} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a></div></div></footer>
    </div>
  )
}
