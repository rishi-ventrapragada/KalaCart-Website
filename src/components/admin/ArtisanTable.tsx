import type { ReactNode } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import type { AsyncState } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ArtisanTableProps {
  state: AsyncState
  count: number
  onRetry: () => void
  onClear: () => void
  /** Whether any filter is applied, so the empty state can offer the right way out. */
  filtered: boolean
  children: ReactNode
}

/** Enough rows to fill the fold without pretending to know the count. */
const SKELETON_COUNT = 6

const headings = [
  'admin.artisans.colArtisan',
  'admin.artisans.colCraft',
  'admin.artisans.colRegion',
  'admin.artisans.colStatus',
  'admin.artisans.colProducts',
  'admin.artisans.colActions',
] as const

/**
 * The table shell and its three states (PRD 5.4, 11.7).
 *
 * Presentational only: the status-change logic lives in useArtisanAdmin, so
 * this file decides nothing about what happens when a row is acted on.
 */
export function ArtisanTable({
  state,
  count,
  onRetry,
  onClear,
  filtered,
  children,
}: ArtisanTableProps) {
  const t = useT()

  if (state === 'error') {
    return <ErrorState message={t('admin.artisans.error')} onRetry={onRetry} />
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="ml-auto h-6 w-20 rounded-control" />
          </div>
        ))}
      </div>
    )
  }

  if (count === 0) {
    return (
      <EmptyState
        title={t('admin.artisans.emptyTitle')}
        body={t('admin.artisans.emptyBody')}
        action={
          filtered ? (
            <button
              type="button"
              onClick={onClear}
              className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
            >
              {t('admin.artisans.clear')}
            </button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left max-sm:block">
        {/*
          The header is for the desktop table only. Below `sm` the rows become
          stacked blocks that carry their own inline labels, where a row of
          column headings would be describing a layout that is no longer there.
        */}
        <thead className="max-sm:hidden">
          <tr className="border-b border-line-strong">
            {headings.map((key) => (
              <th
                key={key}
                scope="col"
                className="py-2 pr-4 text-2xs font-medium tracking-[0.01em] text-muted"
              >
                {t(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:flex max-sm:flex-col max-sm:gap-3">{children}</tbody>
      </table>
    </div>
  )
}
