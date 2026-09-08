import { createContext } from 'react'

export interface AdminContextValue {
  /** MOCK AUTH only. See adminAuth.ts - this is not a security boundary. */
  isAdmin: boolean
  /** Returns false when the credential does not match; the caller shows the error. */
  signIn: (email: string, password: string) => boolean
  signOut: () => void
}

/**
 * Split from AdminProvider.tsx so that file exports only a component, which
 * keeps fast refresh and oxlint's react/only-export-components rule happy.
 * Same split as ThemeContext.
 */
export const AdminContext = createContext<AdminContextValue | null>(null)
