import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

export type QueueTab = 'artisans' | 'products'

interface QueueTabsProps {
  active: QueueTab
  onChange: (tab: QueueTab) => void
  /** Null while the counts are still loading, so the tab shows no number yet. */
  artisanCount: number | null
  productCount: number | null
}

/**
 * The Artisans / Products switch (PRD 11.6), carrying how many are waiting in
 * each so a reviewer can see where the work is without clicking through.
 *
 * A real tablist with arrow-key support comes from the roving `tab` roles: the
 * two panels are the same list rendered from different data, so the semantics
 * are what tell a screen reader that switching does not navigate away.
 */
export function QueueTabs({ active, onChange, artisanCount, productCount }: QueueTabsProps) {
  const t = useT()

  const tabs: { id: QueueTab; label: string; count: number | null }[] = [
    { id: 'artisans', label: t('admin.queue.tabArtisans'), count: artisanCount },
    { id: 'products', label: t('admin.queue.tabProducts'), count: productCount },
  ]

  return (
    <div role="tablist" aria-label={t('admin.queue.title')} className="flex gap-2">
      {tabs.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`queue-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`queue-panel-${tab.id}`}
            onClick={() => {
              onChange(tab.id)
            }}
            className={cn(
              'rounded-control border px-4 py-2 text-sm',
              'transition-[background-color,border-color,color] duration-200 ease-site',
              selected
                ? 'border-accent bg-card text-ink'
                : 'border-line-strong text-muted hover:border-accent hover:text-ink',
            )}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 text-2xs text-muted">
                {t('admin.queue.pendingCount', { count: tab.count })}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
