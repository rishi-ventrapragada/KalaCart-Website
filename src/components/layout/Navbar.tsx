import { Menu, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Link, NavLink } from 'react-router-dom'

import { prefersReducedMotion } from '@/app/lenis'

import { Container } from '@/components/layout/Container'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useScrollRegister } from '@/components/motion/useScrollRegister'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

const linkClasses = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'text-sm tracking-[-0.005em] transition-colors duration-200 ease-site',
    isActive ? 'text-ink' : 'text-muted hover:text-ink',
  )

/**
 * Where the nav flips from gradient to frosted glass (PRD 10.5 asks for ~40px).
 *
 * Two thresholds, not one. A single boundary makes a scroll parked exactly on
 * it strobe between the two states as the smoothed value jitters either side;
 * the gap means the flip has to be committed to before it reverses.
 */
const GLASS_ON = 40
const GLASS_OFF = 32

/**
 * Global chrome per PRD 11.0: logo to Home, a Browse link, a search entry, the
 * theme toggle, a discreet Admin link, collapsing to a menu on small screens.
 *
 * On Home it also carries the PRD 10.5 chrome: a soft top-down gradient at
 * rest, becoming frosted glass after about 40px of scroll through a single
 * class flip driven by the one engine. Off Home there is no engine, so the nav
 * renders in its solid resting state and never subscribes to anything - which
 * is what keeps Browse and admin free of the motion system.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [glass, setGlass] = useState(false)
  const register = useScrollRegister()
  const t = useT()

  useEffect(() => {
    if (!register) return

    // The engine calls this every frame, so the current state is tracked in a
    // local rather than read from React: a stale closure over `glass` would
    // compare against the wrong threshold, and depending on `glass` would tear
    // the subscription down and rebuild it on each flip.
    let on = false

    return register(null, ({ y }) => {
      const next = on ? y > GLASS_OFF : y > GLASS_ON
      if (next === on) return
      on = next
      setGlass(next)
    })
  }, [register])

  // The gradient-at-rest state belongs to the Home motion system, which is the
  // only place something is designed to scroll underneath it. Off Home there is
  // no engine to ever flip it to glass, so a transparent nav would leave bare
  // labels sitting over passing content: those routes keep the solid chrome.
  //
  // Reduced motion gets the same treatment for the same reason. The engine
  // renders once and stops there, so the flip would never fire and the nav
  // would stay transparent over everything that scrolls beneath it. A frosted
  // nav is not motion, so pinning it on costs nothing and keeps the chrome
  // legible (PRD 10.7: usable with motion off, no exceptions).
  const onMotionRoute = register !== null && !prefersReducedMotion()

  return (
    <header
      data-glass={glass ? '' : undefined}
      className={cn(
        // The hairline is unconditional. It used to be part of the glass flip,
        // so at rest on Home the header had no bottom edge at all and the
        // chrome bled into the page - most visible now that the hero ground
        // carries a full-strength texture right up under it. The border is a
        // structural boundary, not a scroll affordance: PRD 10.5 asks the
        // *fill* to change on scroll, not the edge.
        'sticky top-0 z-40 border-b border-line-strong',
        // Colour and blur only. Never geometry, and never `transition: all`.
        'transition-[background-color,border-color,backdrop-filter] duration-300 ease-site',
        glass || !onMotionRoute
          ? 'bg-glass backdrop-blur-md'
          : 'bg-gradient-to-b from-canvas to-transparent',
      )}
    >
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
            {/*
              A navigation affordance, not a form control: it links to Browse,
              where PRD 11.3 puts the real search in the URL. Deliberately not
              the Input primitive, which would need a submit target that does
              not exist until Increment 9. Border is line-strong (3.13:1 light,
              3.37:1 dark), the functional-boundary token.
            */}
            <Link
              to="/browse"
              aria-label={t('common.search')}
              className="hidden items-center gap-2 rounded-control border border-line-strong px-3.5 py-2 text-sm text-muted transition-[border-color,color] duration-200 ease-site hover:border-accent hover:text-ink sm:flex"
            >
              <Search size={15} aria-hidden />
              <span>{t('nav.searchPlaceholder')}</span>
            </Link>

            <ThemeToggle />

            {/*
              Discreet per PRD 11.0: demoted by scale and position, not by
              colour. Dimming it further would drop it under AA, which the
              Increment 5 contrast pass just resolved. It trails the toggle as a
              utility rather than sitting beside Browse as a peer.
            */}
            <NavLink
              to="/admin"
              className={cn(
                'hidden text-xs tracking-[-0.005em] text-muted',
                'transition-colors duration-200 ease-site hover:text-ink sm:block',
              )}
            >
              {t('nav.admin')}
            </NavLink>

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
