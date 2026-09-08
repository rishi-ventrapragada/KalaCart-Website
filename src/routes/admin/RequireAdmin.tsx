import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { ADMIN_LOGIN_PATH } from '@/app/adminAuth'
import { useAdmin } from '@/app/useAdmin'

/**
 * Sends an unauthenticated visitor to the login screen (PRD 11.1).
 *
 * MOCK AUTH. This is a routing convenience, not a security boundary - see
 * adminAuth.ts. It stops someone wandering into a half-built desk; it stops
 * nobody who opens the console.
 *
 * `replace` so the guarded URL does not become a history entry: without it,
 * Back from the login screen returns to the route that just bounced, which
 * bounces again, and the visitor is stuck.
 *
 * The attempted path rides along in location state so a deep link survives the
 * detour - someone who opened /admin/analytics signed out lands there after
 * signing in, rather than at the default desk.
 */
export function RequireAdmin() {
  const { isAdmin } = useAdmin()
  const location = useLocation()

  if (!isAdmin) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
