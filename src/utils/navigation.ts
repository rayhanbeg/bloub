import { useEffect, useState } from 'react'

/** Internal destinations shared by the landing page and the editor shell. */
export const ROUTES = {
  home: '/',
  editor: '/editor',
  presets: '/presets',
  settings: '/settings',
} as const

export const normalPathname = (pathname: string): string => pathname.replace(/\/+$/, '') || '/'

/** Push a first-party route without remounting the application state. */
export function navigate(pathname: string): void {
  if (typeof window === 'undefined') return
  const target = normalPathname(pathname)
  if (normalPathname(window.location.pathname) === target) return
  window.history.pushState(null, '', target)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Subscribe to browser navigation for the small History-API route surface. */
export function usePathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? ROUTES.home : normalPathname(window.location.pathname),
  )

  useEffect(() => {
    const update = () => setPathname(normalPathname(window.location.pathname))
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  return pathname
}
