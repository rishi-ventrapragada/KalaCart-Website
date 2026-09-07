import { createContext } from 'react'

export type ToastTone = 'neutral' | 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

export interface ToastContextValue {
  /** Shows a toast; it dismisses itself after a few seconds. */
  showToast: (message: string, tone?: ToastTone) => void
}

/** Split from Toaster.tsx so that file exports only components. */
export const ToastContext = createContext<ToastContextValue | null>(null)
