import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { Toast } from '@/components/ui/Toast'
import {
  ToastContext,
  type ToastContextValue,
  type ToastItem,
  type ToastTone,
} from '@/components/ui/toastContext'
import { useT } from '@/lib/i18n'

const DISMISS_AFTER_MS = 4000

interface ToasterProps {
  children: ReactNode
}

/**
 * Holds the toast queue and renders the live region. Announcements are polite,
 * so they do not interrupt a screen reader mid-sentence.
 */
export function Toaster({ children }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const t = useT()

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'neutral') => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, message, tone }])
      setTimeout(() => {
        dismiss(id)
      }, DISMISS_AFTER_MS)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label={t('ui.notifications')}
        className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              tone={toast.tone}
              onDismiss={() => {
                dismiss(toast.id)
              }}
            />
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
