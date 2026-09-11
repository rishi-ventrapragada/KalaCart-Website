import { X } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { BrandLockup } from '@/components/brand/BrandLockup'
import { useFocusTrap } from '@/components/ui/useFocusTrap'
import { useT } from '@/lib/i18n'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

/** The nav's collapsed form (PRD 11.0). Focus-trapped and Escape-closable. */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const t = useT()

  useFocusTrap(panelRef, open, onClose)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 sm:hidden" role="presentation">
      <div aria-hidden className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.primary')}
        tabIndex={-1}
        className="relative ml-auto flex h-full w-64 flex-col gap-1 border-l border-line bg-card p-4"
      >
        {/*
          The panel covers the navbar it slid out of, so without this the brand
          is the one thing that disappears the moment someone opens the menu.
          The mark sits opposite the close button on the same line rather than
          taking a row of its own, which would push the links down the panel.
        */}
        <div className="mb-2 flex items-center justify-between">
          <BrandLockup markSize={20} textClassName="text-base" className="text-ink" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            className="rounded-control p-1 text-muted transition-colors duration-200 ease-site hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <Link to="/" onClick={onClose} className="rounded-card px-2 py-2 text-sm text-ink">
          {t('nav.home')}
        </Link>
        <Link to="/browse" onClick={onClose} className="rounded-card px-2 py-2 text-sm text-ink">
          {t('nav.browse')}
        </Link>
        <Link to="/artisans" onClick={onClose} className="rounded-card px-2 py-2 text-sm text-ink">
          {t('nav.artisans')}
        </Link>
        <Link
          to="/admin"
          onClick={onClose}
          className="rounded-card px-2 py-2 text-sm text-muted"
        >
          {t('nav.admin')}
        </Link>
      </div>
    </div>
  )
}
