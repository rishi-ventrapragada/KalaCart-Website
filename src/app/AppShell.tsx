import { Outlet } from 'react-router-dom'

import { ThemeProvider } from '@/app/ThemeProvider'
import { useLenis } from '@/app/useLenis'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/Toaster'

/**
 * The persistent frame around every route. The Home-only progress bar lands
 * with the motion system in Increment 7.
 */
export default function AppShell() {
  useLenis()

  return (
    <ThemeProvider>
      <Toaster>
        <div className="flex min-h-dvh flex-col bg-canvas text-ink">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </Toaster>
    </ThemeProvider>
  )
}
