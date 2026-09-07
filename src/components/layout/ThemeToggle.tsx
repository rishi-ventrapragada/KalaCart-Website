import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/app/useTheme'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ThemeToggleProps {
  className?: string
}

/**
 * Switches between the two palettes.
 *
 * Lives in the Navbar per PRD 11.0. Capsule shape per the PRD 9.5 shape binary.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()
  const t = useT()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      aria-pressed={isDark}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-control',
        'border border-line-strong bg-card text-muted',
        'transition-[border-color,color] duration-200 ease-site',
        'hover:border-accent hover:text-ink',
        className,
      )}
    >
      {isDark ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
    </button>
  )
}
