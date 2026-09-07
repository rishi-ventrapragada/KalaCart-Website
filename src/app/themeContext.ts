import { createContext } from 'react'

import type { ThemeName } from '@/app/theme'

export interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  toggle: () => void
}

/**
 * Split from ThemeProvider.tsx so that file exports only a component, which
 * keeps fast refresh and oxlint's react/only-export-components rule happy.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)
