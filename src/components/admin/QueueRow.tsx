import { RemoteImage } from '@/components/ui/RemoteImage'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import type { Category } from '@/lib/data'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/formatDate'

/** Tailwind cannot see a class assembled at runtime, so the map is explicit. */
const DYE_DOT: Record<Category['dye'], string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
}

interface QueueRowProps {
  imageUrl: string
  /** The artisan's name or the product's title. */
  name: string
  category?: Category | undefined
  /** Region for an artisan; the maker's region for a product. */
  region?: string | undefined
  createdAt: string
  /** True while this row's write is in flight. */
  busy: boolean
  onApprove: () => void
  onReject: () => void
  onPreview: () => void
}

/**
 * One pending item (PRD 11.6): thumbnail, name, category, region, submitted
 * date, and the three actions.
 *
 * A flex row rather than a table. The desk has to work at 360px, where a real
 * table either scrolls sideways or crushes its columns; this stacks instead and
 * keeps every action reachable with a thumb.
 */
export function QueueRow({
  imageUrl,
  name,
  category,
  region,
  createdAt,
  busy,
  onApprove,
  onReject,
  onPreview,
}: QueueRowProps) {
  const t = useT()

  return (
    <li
      className={cn(
        'flex flex-col gap-4 rounded-card border border-line bg-card p-4',
        'sm:flex-row sm:items-center',
        // The row is leaving; dim it so the write reads as in progress without
        // moving anything. Colour only, never geometry.
        busy && 'opacity-50',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {/*
          rounded-lg, not rounded-card. The 22px card radius is scaled for a
          card; on a 64px thumbnail it consumes a third of each edge and the
          image reads as a blob rather than a photograph of the goods. The
          shape binary (PRD 9.5) allows 18-28px for CARDS - a thumbnail is a
          detail inside one, and it has to look like the same system.
        */}
        <RemoteImage
          src={imageUrl}
          alt=""
          wrapperClassName="size-14 shrink-0 rounded-lg sm:size-16"
        />

        <div className="flex min-w-0 flex-col gap-1">
          {/* Truncated, not wrapped: a long saree title must not push the
              actions off a 360px screen. */}
          <p className="truncate font-display text-base leading-tight text-ink">{name}</p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-muted">
            {category && (
              <span className="inline-flex items-center gap-1.5">
                {/* Tone in the dot, never the label: the dyes fail AA as text
                    in both themes (Increment 5). */}
                <span className={cn('size-1.5 rounded-full', DYE_DOT[category.dye])} />
                {category.name}
              </span>
            )}
            {region ? <span>{region}</span> : null}
            <span>{t('admin.queue.submitted', { date: formatDate(createdAt) })}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={onPreview}
          disabled={busy}
          className={cn(buttonBase, buttonVariants.ghost, buttonSizes.sm)}
        >
          {t('admin.queue.preview')}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
        >
          {t('admin.queue.reject')}
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          className={cn(buttonBase, buttonVariants.primary, buttonSizes.sm)}
        >
          {t('admin.queue.approve')}
        </button>
      </div>
    </li>
  )
}
