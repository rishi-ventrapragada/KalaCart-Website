import { Outlet } from 'react-router-dom'

import { MotionProvider } from '@/app/MotionProvider'
import { useLenis } from '@/app/useLenis'
import { useScrollReset } from '@/app/useScrollReset'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'

/**
 * The persistent frame around every BUYER route.
 *
 * MotionProvider wraps the chrome as well as the outlet, because the navbar's
 * glass flip and the progress bar are both driven by the same scroll value as
 * the Home hero and have to read the one engine (PRD 10.1, 10.5).
 *
 * The theme, toast and admin providers moved up to RootProviders in Increment
 * 12 so the admin desk could have them without inheriting this chrome or the
 * Lenis instance below. What this file renders is unchanged.
 */
export default function AppShell() {
  useLenis()
  // Sits beside the Lenis mount rather than in MotionProvider: both are about
  // who owns the scroll position, and the reset goes through the instance this
  // line creates.
  useScrollReset()

  return (
    <MotionProvider>
      <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </MotionProvider>
  )
}
