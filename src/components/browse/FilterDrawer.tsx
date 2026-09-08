import { X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'

import { useFocusTrap } from '@/components/ui/useFocusTrap'
import { useT } from '@/lib/i18n'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * The filter panel's mobile form (PRD 11.3 asks for a drawer on mobile).
 *
 * Focus-trapped and Escape-closable through the shared hook, which also
 * restores focus to the trigger on close and locks body scroll - Lenis would
 * otherwise keep driving the page behind an open overlay.
 *
 * The panel is scrollable in its own right: six controls plus a keyboard on a
 * 360px screen leaves very little height, and a drawer that cannot scroll puts
 * the price fields out of reach.
 */
export function FilterDrawer({ open, onClose, children }: FilterDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const t = useT()

  useFocusTrap(panelRef, open, onClose)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <div aria-hidden className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('browse.filters.heading')}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col bg-card"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg text-ink">{t('browse.filters.heading')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('browse.filters.close')}
            className="rounded-control p-1.5 text-muted transition-colors duration-200 ease-site hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
