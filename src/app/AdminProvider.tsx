import { useCallback, useMemo, useState, type ReactNode } from 'react'

import {
  ADMIN_STORAGE_KEY,
  ADMIN_STORAGE_VALUE,
  isValidMockCredential,
} from '@/app/adminAuth'
import { AdminContext, type AdminContextValue } from '@/app/adminContext'

/**
 * Reads the flag left by a sign-in earlier in this session.
 *
 * Storage can throw in private modes or with site data blocked, so a failure
 * reads as signed out rather than crashing the app - the same guard
 * ThemeProvider uses.
 */
function readStoredFlag(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) === ADMIN_STORAGE_VALUE
  } catch {
    return false
  }
}

interface AdminProviderProps {
  children: ReactNode
}

/**
 * Holds the MOCK admin flag (PRD 11.1). Not a security boundary: see the block
 * comment in adminAuth.ts for why, and MockAuthNotice for how that is disclosed
 * to whoever is looking at the screen.
 *
 * State is initialised from sessionStorage rather than synced to it by an
 * effect, so a refresh on an admin route resolves the flag during the first
 * render. An effect would leave the guard seeing `false` on that render and
 * bounce a signed-in reviewer to the login screen on every refresh.
 */
export function AdminProvider({ children }: AdminProviderProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(readStoredFlag)

  const signIn = useCallback((email: string, password: string): boolean => {
    if (!isValidMockCredential(email, password)) return false

    setIsAdmin(true)
    try {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, ADMIN_STORAGE_VALUE)
    } catch {
      // Persisting is a convenience; the session still works in memory.
    }
    return true
  }, [])

  const signOut = useCallback(() => {
    setIsAdmin(false)
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY)
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  }, [])

  const value = useMemo<AdminContextValue>(
    () => ({ isAdmin, signIn, signOut }),
    [isAdmin, signIn, signOut],
  )

  return <AdminContext value={value}>{children}</AdminContext>
}
