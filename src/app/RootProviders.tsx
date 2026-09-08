import { Outlet } from 'react-router-dom'

import { AdminProvider } from '@/app/AdminProvider'
import { ThemeProvider } from '@/app/ThemeProvider'
import { Toaster } from '@/components/ui/Toaster'

/**
 * Everything both the buyer site and the admin desk need, and nothing either
 * one owns alone.
 *
 * Extracted from AppShell in Increment 12. The admin routes need the theme, the
 * toast queue and the admin flag, but must NOT get the buyer chrome or Lenis:
 * PRD 10.8 keeps smooth scroll to Home, and a moderation desk framed by the
 * shopper's navbar and marketing footer is the wrong surface for the job.
 *
 * So the providers moved up here and each surface supplies its own chrome
 * underneath: AppShell for the buyer routes, AdminShell for /admin/*. AppShell
 * renders exactly what it rendered before; it simply no longer owns the
 * providers.
 *
 * AdminProvider sits inside ThemeProvider only for ordering tidiness - it has
 * no dependency on the theme, but a provider that reads storage belongs below
 * the one that establishes the document's theme attribute.
 */
export default function RootProviders() {
  return (
    <ThemeProvider>
      <Toaster>
        <AdminProvider>
          <Outlet />
        </AdminProvider>
      </Toaster>
    </ThemeProvider>
  )
}
