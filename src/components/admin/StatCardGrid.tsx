import { StatCard } from '@/components/admin/StatCard'
import type { AnalyticsSummary } from '@/lib/data'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/types'

/**
 * The five figures PRD 11.8 names, in the order it names them: the population
 * first, then how it splits, then what it has produced.
 */
const CARDS: { key: keyof AnalyticsSummary; label: TranslationKey }[] = [
  { key: 'totalArtisans', label: 'admin.analytics.totalArtisans' },
  { key: 'approvedArtisans', label: 'admin.analytics.approvedArtisans' },
  { key: 'pendingArtisans', label: 'admin.analytics.pendingArtisans' },
  { key: 'totalProducts', label: 'admin.analytics.totalProducts' },
  { key: 'totalInquiries', label: 'admin.analytics.totalInquiries' },
]

interface StatCardGridProps {
  /** Null while loading; each card shows its own skeleton. */
  summary: AnalyticsSummary | null
}

export function StatCardGrid({ summary }: StatCardGridProps) {
  const t = useT()

  return (
    /*
      One column at 360px, two on a small tablet, all five across on a desk.
      Five is prime, so a 2-column layout leaves a widow - it sits in the first
      cell of the last row, which reads as deliberate emphasis rather than as a
      leftover, so no span trickery is needed to hide it.
    */
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {CARDS.map((card) => {
        const value = summary?.[card.key]
        return (
          <StatCard
            key={card.key}
            label={t(card.label)}
            value={typeof value === 'number' ? value : null}
          />
        )
      })}
    </div>
  )
}
