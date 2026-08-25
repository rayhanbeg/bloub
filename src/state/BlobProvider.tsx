/**
 * App state. Plain React context — one config object, one settings object, and
 * setters. Deliberately tiny: the interesting logic lives in `src/core`, which
 * knows nothing about React.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_SHAPE, SHAPES } from '../shapes'
import { DEFAULT_MOOD, MOODS } from '../moods'
import { DEFAULT_COLOR, PALETTE } from '../core/palette'
import { DEFAULT_EXPORT_SETTINGS } from '../utils/export'
import type { ExportSettings } from '../utils/export'
import type { BlobConfig } from '../core/types'

export { DEFAULT_COLOR }

/** Which panel the left icon rail is showing. */
export type Tab = 'style' | 'presets' | 'settings'

/** The app has three section-level routes; the editor's style section is home. */
const TAB_PATHS: Record<Tab, string> = {
  style: '/',
  presets: '/presets',
  settings: '/settings',
}

const normalPathname = (pathname: string): string => pathname.replace(/\/+$/, '') || '/'

function tabForPathname(pathname: string): Tab | undefined {
  const path = normalPathname(pathname)
  return path === '/settings' ? 'settings' : path === '/presets' ? 'presets' : path === '/' ? 'style' : undefined
}

const initialTab = (): Tab =>
  typeof window === 'undefined' ? 'style' : (tabForPathname(window.location.pathname) ?? 'style')

/**
 * Everything the Settings panel owns. Export options live in `ExportSettings`;
 * `idle` is the one setting that changes the app rather than the output.
 */
export interface Settings extends ExportSettings {
  /** Run the breathing/blinking loop in the preview. */
  idle: boolean
}

const DEFAULT_SETTINGS: Settings = { ...DEFAULT_EXPORT_SETTINGS, idle: true }

interface BlobStore {
  config: BlobConfig
  setShape: (id: string) => void
  setMood: (id: string) => void
  setColor: (hex: string) => void
  /** Apply a whole config at once — used by presets and shuffle. */
  setConfig: (config: BlobConfig) => void
  shuffle: () => void
  settings: Settings
  /**
   * TypeScript note: `Partial<Settings>` is a built-in mapped type meaning
   * "every field of Settings, but all optional" — so callers can pass just the
   * one key they're changing.
   */
  updateSettings: (patch: Partial<Settings>) => void
  tab: Tab
  setTab: (tab: Tab) => void
}

/**
 * TypeScript note: `createContext<BlobStore | null>(null)` says the context
 * holds either a store or null. The `useBlob` hook below narrows that back to a
 * plain `BlobStore` by throwing if it's null, so components never have to
 * null-check.
 */
const BlobContext = createContext<BlobStore | null>(null)

/**
 * Pick a random member of an array.
 *
 * TypeScript note: the trailing comma in `<T,>` is not a typo. In a `.tsx` file
 * a bare `<T>` would be parsed as the start of a JSX tag, and the comma is the
 * conventional way to tell the compiler this is a generic parameter list.
 */
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]

export function BlobProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<BlobConfig>({
    shape: DEFAULT_SHAPE,
    mood: DEFAULT_MOOD,
    color: DEFAULT_COLOR,
  })
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [tab, setTabState] = useState<Tab>(initialTab)

  const setShape = useCallback((shape: string) => {
    setConfigState((c) => ({ ...c, shape }))
  }, [])
  const setMood = useCallback((mood: string) => {
    setConfigState((c) => ({ ...c, mood }))
  }, [])
  const setColor = useCallback((color: string) => {
    setConfigState((c) => ({ ...c, color }))
  }, [])
  const setConfig = useCallback((next: BlobConfig) => {
    setConfigState(next)
  }, [])

  const shuffle = useCallback(() => {
    setConfigState({
      shape: pick(SHAPES).id,
      mood: pick(MOODS).id,
      color: pick(PALETTE).hex,
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  /** Navigate from the section controls and leave a real browser-history entry. */
  const setTab = useCallback((next: Tab) => {
    setTabState(next)
    if (typeof window === 'undefined') return
    const target = TAB_PATHS[next]
    if (normalPathname(window.location.pathname) !== target) window.history.pushState(null, '', target)
  }, [])

  // Browser Back/Forward and direct/deep links are the source of truth for the
  // selected section. Invalid paths fall back gracefully to the editor route.
  useEffect(() => {
    const applyLocation = () => {
      const next = tabForPathname(window.location.pathname)
      if (next) {
        setTabState(next)
      } else {
        window.history.replaceState(null, '', TAB_PATHS.style)
        setTabState('style')
      }
    }
    applyLocation()
    window.addEventListener('popstate', applyLocation)
    return () => window.removeEventListener('popstate', applyLocation)
  }, [])

  const value = useMemo<BlobStore>(
    () => ({
      config,
      setShape,
      setMood,
      setColor,
      setConfig,
      shuffle,
      settings,
      updateSettings,
      tab,
      setTab,
    }),
    [config, setShape, setMood, setColor, setConfig, shuffle, settings, updateSettings, tab],
  )

  return <BlobContext.Provider value={value}>{children}</BlobContext.Provider>
}

export function useBlob(): BlobStore {
  const store = useContext(BlobContext)
  if (!store) throw new Error('useBlob must be used inside <BlobProvider>')
  return store
}
