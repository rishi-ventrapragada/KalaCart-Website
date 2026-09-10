import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { ADMIN_LOGIN_PATH } from '@/app/adminAuth'
import { useAdmin } from '@/app/useAdmin'
import { useScrollReset } from '@/app/useScrollReset'
import { MockAuthNotice } from '@/components/admin/MockAuthNotice'
import { BackToTop } from '@/components/layout/BackToTop'
import { Container } from '@/components/layout/Container'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useToast } from '@/components/ui/useToast'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

const tabClasses = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'whitespace-nowrap border-b-2 px-1 pb-2 text-sm transition-colors duration-200 ease-site',
    isActive
      ? 'border-accent text-ink'
      : 'border-transparent text-muted hover:text-ink',
  )

/**
 * The frame every signed-in admin surface hangs in (PRD 11.1, 11.6-11.8).
 *
 * Deliberately not the buyer chrome. A moderation desk is an operational tool,
 * not a shopfront: the marketing navbar, the search entry and the footer would
 * all be noise here, and PRD 10.8 keeps the motion system off this surface
 * entirely - this shell mounts no Lenis and no scroll engine, so admin is
 * static by construction rather than by a disabled flag.
 *
 * The theme toggle does come across, because both themes have to be verified
 * on every surface (PRD 14).
 */
export default function AdminLayout() {
  // The desk is outside AppShell and mounts no Lenis, so nothing else would put
  // a tab switch back at the top of a long queue. Takes the native branch.
  useScrollReset()
  const { signOut } = useAdmin()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const t = useT()

  const handleSignOut = (): void => {
    signOut()
    showToast(t('admin.auth.signedOut'))
    void navigate(ADMIN_LOGIN_PATH, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="border-b border-line-strong bg-card">
        <Container>
          <div className="flex h-16 items-center gap-4">
            <Link to="/" className="font-display text-lg tracking-[-0.02em] text-ink">
              {t('brand.name')}
            </Link>
            <span aria-hidden className="text-muted">
              /
            </span>
            <span className="text-sm text-muted">{t('admin.nav.label')}</span>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleSignOut}
                className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
              >
                {t('admin.auth.signOut')}
              </button>
            </div>
          </div>

          <nav aria-label={t('admin.nav.label')} className="flex gap-6 overflow-x-auto">
            <NavLink to="/admin/queue" className={tabClasses}>
              {t('admin.nav.queue')}
            </NavLink>
            <NavLink to="/admin/artisans" className={tabClasses}>
              {t('admin.nav.artisans')}
            </NavLink>
            <NavLink to="/admin/analytics" className={tabClasses}>
              {t('admin.nav.analytics')}
            </NavLink>
          </nav>
        </Container>
      </header>

      <main className="flex-1">
        <Container className="flex flex-col gap-6 py-8">
          {/*
            Carried on every admin page, not just the login screen. Someone who
            signed in ten minutes ago and is now looking at artisan records
            should still be able to see that this desk is a demonstration.
          */}
          <MockAuthNotice variant="banner" />
          <Outlet />
        </Container>
      </main>

      {/*
        The desk has no footer, so this sits at the foot of the shell itself.
        The verification queue is the longest scroll on the site, which is
        exactly where returning to the top by hand is most tedious.
      */}
      <BackToTop />
    </div>
  )
}
