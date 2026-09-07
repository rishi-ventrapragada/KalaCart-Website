import { X } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'

import { useFocusTrap } from '@/components/ui/useFocusTrap'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Actions pinned to the bottom, e.g. Cancel plus a primary button. */
  footer?: ReactNode
  className?: string
}

/**
 * Focus-trapped dialog that closes on Escape or a backdrop click, and returns
 * focus where it came from (CLAUDE.md law 7).
 *
 * Soft rounded rect per the PRD 9.5 shape binary.
 */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const t = useT()

  useFocusTrap(panelRef, open, onClose)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-black/50" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-md rounded-card border border-line bg-card p-5 shadow-lg',
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-control p-1 text-muted transition-colors duration-200 ease-site hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="text-sm text-muted">{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}
