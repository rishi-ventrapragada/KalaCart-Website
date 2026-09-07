import { Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { Container } from '@/components/layout/Container'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

const linkClasses = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'text-sm tracking-[-0.005em] transition-colors duration-200 ease-site',
    isActive ? 'text-ink' : 'text-muted hover:text-ink',
  )

/**
 * Global chrome per PRD 11.0: logo to Home, a Browse link, a search entry, the
 * theme toggle, a discreet Admin link, collapsing to a menu on small screens.
 *
 * The nav-to-glass transition on scroll is part of the Home motion system and
 * lands in Increment 7.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useT()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <Container>
        <nav aria-label={t('nav.primary')} className="flex h-[4.5rem] items-center gap-6">
          <Link to="/" className="font-display text-xl tracking-[-0.02em] text-ink">
            {t('brand.name')}
          </Link>

          <div className="hidden items-center gap-5 sm:flex">
            <NavLink to="/browse" className={linkClasses}>
              {t('nav.browse')}
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/browse"
              aria-label={t('common.search')}
              className="hidden items-center gap-2 rounded-control border border-line-strong px-3.5 py-2 text-sm text-muted transition-[border-color,color] duration-200 ease-site hover:border-accent hover:text-ink sm:flex"
            >
              <Search size={15} aria-hidden />
              <span>{t('nav.searchPlaceholder')}</span>
            </Link>

            <NavLink to="/admin" className={cn(linkClasses({ isActive: false }), 'hidden sm:block')}>
              {t('nav.admin')}
            </NavLink>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => {
                setMenuOpen(true)
              }}
              aria-label={t('nav.openMenu')}
              aria-expanded={menuOpen}
              className="rounded-control border border-line-strong p-2 text-muted transition-[border-color,color] duration-200 ease-site hover:border-accent hover:text-ink sm:hidden"
            >
              <Menu size={18} aria-hidden />
            </button>
          </div>
        </nav>
      </Container>

      <MobileMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false)
        }}
      />
    </header>
  )
}
