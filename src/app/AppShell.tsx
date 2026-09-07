import { Outlet } from 'react-router-dom'

import { ThemeProvider } from '@/app/ThemeProvider'
import { useLenis } from '@/app/useLenis'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

/**
 * The persistent frame around every route. Increment 4 adds the Navbar, Footer
 * and ProgressBar; the floating toggle below moves into the nav then.
 */
export default function AppShell() {
  useLenis()

  return (
    <ThemeProvider>
      <div className="min-h-dvh bg-canvas text-ink">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Outlet />
      </div>
    </ThemeProvider>
  )
}
