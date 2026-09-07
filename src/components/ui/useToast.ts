import { use } from 'react'

import { ToastContext, type ToastContextValue } from '@/components/ui/toastContext'

/** Show a toast. Throws if used outside the Toaster. */
export function useToast(): ToastContextValue {
  const context = use(ToastContext)
  if (!context) throw new Error('useToast must be used inside a Toaster')
  return context
}
