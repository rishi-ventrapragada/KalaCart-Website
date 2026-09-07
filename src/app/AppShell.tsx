import { Outlet } from 'react-router-dom'

import { useLenis } from '@/app/useLenis'

/**
 * The persistent frame around every route. Increment 1 adds the ThemeProvider
 * and Increment 4 the Navbar, Footer and ProgressBar; for now it owns Lenis
 * and nothing else.
 */
export default function AppShell() {
  useLenis()

  return (
    <div className="min-h-dvh">
      <Outlet />
    </div>
  )
}
