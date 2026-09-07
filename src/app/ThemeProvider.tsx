import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { ThemeContext, type ThemeContextValue } from '@/app/themeContext'
import { DEFAULT_THEME, THEME_STORAGE_KEY, type ThemeName } from '@/app/theme'

const isThemeName = (value: string | null): value is ThemeName =>
  value === 'light' || value === 'dark'

/**
 * Reads the theme chosen earlier in this session.
 *
 * STORAGE EXCEPTION. CLAUDE.md law 8 allows browser storage only for the
 * documented mock-auth flag, but PRD 7.1 and the Increment 1 acceptance line
 * both require the theme to persist for the session. This is the second - and
 * only other - documented use of storage in the app. sessionStorage, not
 * localStorage, so it dies with the tab.
 */
function readStoredTheme(): ThemeName {
  try {
    const stored = sessionStorage.getItem(THEME_STORAGE_KEY)
    return isThemeName(stored) ? stored : DEFAULT_THEME
  } catch {
    // Storage can throw in private modes or with site data blocked.
    return DEFAULT_THEME
  }
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeName>(readStoredTheme)

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Persisting is a convenience; the app works without it.
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle }),
    [theme, toggle],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
