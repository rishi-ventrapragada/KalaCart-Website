import { use } from 'react'

import { AdminContext, type AdminContextValue } from '@/app/adminContext'

/** Read the MOCK admin flag. Throws if used outside the provider. */
export function useAdmin(): AdminContextValue {
  const context = use(AdminContext)
  if (!context) throw new Error('useAdmin must be used inside an AdminProvider')
  return context
}
