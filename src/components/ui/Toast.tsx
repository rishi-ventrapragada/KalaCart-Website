import { X } from 'lucide-react'

import type { ToastTone } from '@/components/ui/toastContext'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ToastProps {
  message: string
  tone: ToastTone
  onDismiss: () => void
}

const tones: Record<ToastTone, string> = {
  neutral: 'border-line',
  success: 'border-accent',
  error: 'border-secondary',
}

/** Soft rounded rect per the PRD 9.5 shape binary. */
export function Toast({ message, tone, onDismiss }: ToastProps) {
  const t = useT()

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-card border bg-card px-4 py-3 text-sm text-ink shadow-lg',
        'motion-safe:animate-toast-in',
        tones[tone],
      )}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('common.dismiss')}
        className="rounded-control p-0.5 text-muted transition-colors duration-200 ease-site hover:text-ink"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  )
}
