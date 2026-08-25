/**
 * Toasts. One at a time, bottom-centred, auto-dismissing — just enough feedback
 * for the export actions to be honest about what happened.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertIcon, CheckIcon } from './Icons'

type ToastKind = 'ok' | 'error'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

interface ToastApi {
  /** Show a toast. Defaults to the success style. */
  toast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, kind: ToastKind = 'ok') => {
    const id = nextId.current++
    setItems((current) => [...current.slice(-2), { id, message, kind }])
    window.setTimeout(() => {
      setItems((current) => current.filter((t) => t.id !== id))
    }, kind === 'error' ? 4200 : 2400)
  }, [])

  const api = useMemo<ToastApi>(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-7 z-50 flex flex-col items-center gap-2 px-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 32,
                mass: 0.7,
              }}
              className="flex max-w-full items-center gap-2 rounded-full bg-zinc-900 px-3.5 py-2 text-[12.5px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.16)]"
            >
              {item.kind === 'ok' ? (
                <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              ) : (
                <AlertIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              )}
              <span className="min-w-0">{item.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}
