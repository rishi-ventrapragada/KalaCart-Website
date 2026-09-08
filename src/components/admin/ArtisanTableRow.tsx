import { StatusBadge } from '@/components/admin/StatusBadge'
import { RemoteImage } from '@/components/ui/RemoteImage'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { actionsFor, type StatusAction } from '@/lib/admin/artisanActions'
import type { Artisan, Category } from '@/lib/data'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/types'
import { cn } from '@/lib/utils/cn'

const ACTION_LABEL: Record<StatusAction['kind'], TranslationKey> = {
  approve: 'admin.artisans.approve',
  reject: 'admin.artisans.reject',
  reinstate: 'admin.artisans.reinstate',
}

interface ArtisanTableRowProps {
  artisan: Artisan
  category?: Category | undefined
  busy: boolean
  onAction: (action: StatusAction) => void
}

/**
 * One artisan (PRD 11.7).
 *
 * A real `<tr>`: the desktop view is a genuine table because these are records
 * being compared down columns, which is exactly what a table is for and what a
 * screen reader announces correctly. The 360px layout collapses the same markup
 * to stacked blocks with CSS, so there is one DOM rather than two renderings to
 * keep in step.
 */
export function ArtisanTableRow({ artisan, category, busy, onAction }: ArtisanTableRowProps) {
  const t = useT()
  const actions = actionsFor(artisan.status)

  return (
    <tr
      className={cn(
        'border-b border-line last:border-0',
        // Colour only while a write is in flight. Never geometry.
        busy && 'opacity-50',
        'max-sm:flex max-sm:flex-col max-sm:gap-3 max-sm:rounded-card max-sm:border',
        'max-sm:bg-card max-sm:p-4',
      )}
    >
      <td className="py-3 pr-4 max-sm:p-0">
        <div className="flex items-center gap-3">
          <RemoteImage
            src={artisan.photoUrl}
            alt=""
            wrapperClassName="size-10 shrink-0 rounded-full"
          />
          <span className="font-display text-base leading-tight text-ink">{artisan.name}</span>
        </div>
      </td>

      <td className="py-3 pr-4 text-sm text-muted max-sm:p-0">
        {/* The label only on the stacked layout, where a bare value has lost
            its column header. */}
        <span className="hidden text-2xs max-sm:inline">{t('admin.artisans.colCraft')}: </span>
        {category?.name ?? ''}
      </td>

      <td className="py-3 pr-4 text-sm text-muted max-sm:p-0">
        <span className="hidden text-2xs max-sm:inline">{t('admin.artisans.colRegion')}: </span>
        {artisan.region}
      </td>

      <td className="py-3 pr-4 max-sm:p-0">
        <StatusBadge status={artisan.status} />
      </td>

      <td className="py-3 pr-4 text-sm text-muted max-sm:p-0">
        {t('admin.artisans.productCount', { count: artisan.productCount ?? 0 })}
      </td>

      <td className="py-3 max-sm:p-0">
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.kind}
              type="button"
              disabled={busy}
              onClick={() => {
                onAction(action)
              }}
              className={cn(
                buttonBase,
                buttonSizes.sm,
                action.kind === 'approve' ? buttonVariants.primary : buttonVariants.secondary,
              )}
            >
              {t(ACTION_LABEL[action.kind])}
            </button>
          ))}
        </div>
      </td>
    </tr>
  )
}
