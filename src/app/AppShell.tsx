import { Outlet } from 'react-router-dom'

import { MotionProvider } from '@/app/MotionProvider'
import { ThemeProvider } from '@/app/ThemeProvider'
import { useLenis } from '@/app/useLenis'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/Toaster'

/**
 * The persistent frame around every route.
 *
 * MotionProvider wraps the chrome as well as the outlet, because the navbar's
 * glass flip and the progress bar are both driven by the same scroll value as
 * the Home hero and have to read the one engine (PRD 10.1, 10.5).
 */
export default function AppShell() {
  useLenis()

  return (
    <ThemeProvider>
      <Toaster>
        <MotionProvider>
          <div className="flex min-h-dvh flex-col bg-canvas text-ink">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </MotionProvider>
      </Toaster>
    </ThemeProvider>
  )
}
