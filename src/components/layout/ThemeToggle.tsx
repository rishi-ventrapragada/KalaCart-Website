import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/app/useTheme'
import { cn } from '@/lib/utils/cn'

interface ThemeToggleProps {
  className?: string
}

/**
 * Switches between the two palettes.
 *
 * PRD 11.0 puts this in the nav; the Navbar arrives in Increment 4, so for now
 * AppShell mounts it directly and it moves in then.
 *
 * Capsule shape per the PRD 9.5 shape binary. Copy is hardcoded until the i18n
 * seam lands in Increment 3, which will replace the label with a key.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-control',
        'border border-line bg-card text-muted',
        'transition-colors duration-200 ease-site',
        'hover:text-ink hover:border-line-strong',
        className,
      )}
    >
      {isDark ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
    </button>
  )
}
