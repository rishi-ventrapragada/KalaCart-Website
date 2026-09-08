import type { ReactNode } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AsyncState } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

interface QueueListProps {
  state: AsyncState
  /** Rows already filtered through the optimistic removals. */
  count: number
  emptyTitle: string
  onRetry: () => void
  tab: string
  children: ReactNode
}

/** Enough rows to fill the fold without pretending to know the count. */
const SKELETON_COUNT = 4

/**
 * The three states around a queue tab (PRD 5.4, 11.6).
 *
 * Presentational only: the optimistic logic lives in useQueue, so this file
 * decides nothing about what happens when a row is acted on and can be read as
 * pure layout.
 */
export function QueueList({
  state,
  count,
  emptyTitle,
  onRetry,
  tab,
  children,
}: QueueListProps) {
  const t = useT()

  const panelProps = {
    role: 'tabpanel',
    id: `queue-panel-${tab}`,
    'aria-labelledby': `queue-tab-${tab}`,
  }

  if (state === 'error') {
    return (
      <div {...panelProps}>
        <ErrorState message={t('admin.queue.error')} onRetry={onRetry} />
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div {...panelProps} className="flex flex-col gap-3">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          // Matches the row's geometry, so the list does not reflow when the
          // real rows land.
          <div
            key={i}
            className="flex items-center gap-4 rounded-card border border-line bg-card p-4"
          >
            {/* Matches QueueRow's thumbnail radius, not the card's. */}
            <Skeleton className="size-14 shrink-0 rounded-lg sm:size-16" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24 rounded-control" />
          </div>
        ))}
      </div>
    )
  }

  if (count === 0) {
    return (
      <div {...panelProps}>
        {/* Good news, not an absence (PRD 11.6). No body copy: the title
            already says everything, and a second line would invent a next
            action where there is none. */}
        <EmptyState title={emptyTitle} />
      </div>
    )
  }

  return (
    <ul {...panelProps} className="flex flex-col gap-3">
      {children}
    </ul>
  )
}
