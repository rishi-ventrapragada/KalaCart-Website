import { useCallback } from 'react'

import { BarChartCard } from '@/components/admin/BarChartCard'
import { LineChartCard } from '@/components/admin/LineChartCard'
import { StatCardGrid } from '@/components/admin/StatCardGrid'
import { ErrorState } from '@/components/ui/ErrorState'
import { toCategoryBars, toCumulativeSeries } from '@/lib/admin/analyticsView'
import { getAnalyticsSummary, getCategories } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

/**
 * The admin analytics desk (PRD 11.8): five figures and two charts.
 *
 * Reveal-only by omission - no Lenis, no scroll engine, nothing that moves on
 * scroll (PRD 10.8). Charts are hand-rolled SVG and CSS rather than Recharts
 * (CLAUDE.md section D, Increment 15).
 *
 * No empty state, deliberately: the summary always returns numbers, so there is
 * no "no data" case to design for. Loading and error are both handled.
 */
export default function Analytics() {
  const t = useT()

  /*
   * One read for both panels. The categories come along for the dye tones -
   * the summary names categories but carries no colour, and a component may
   * not reach past the seam to the fixtures for it.
   */
  const fetchPage = useCallback(async () => {
    const [summary, categories] = await Promise.all([getAnalyticsSummary(), getCategories()])
    return { summary, categories }
  }, [])

  const page = useAsyncData(fetchPage)
  const summary = page.data?.summary ?? null
  const loading = page.state === 'loading'

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">{t('admin.analytics.title')}</h1>
        <p className="text-sm text-muted">{t('admin.analytics.intro')}</p>
      </div>

      {page.state === 'error' ? (
        /*
         * One error state for the whole page, not six. A single read backs
         * every panel here, so six retry buttons for one failure would be
         * theatre - they would all retry the same request.
         */
        <ErrorState message={t('admin.analytics.error')} onRetry={page.retry} />
      ) : (
        <>
          <StatCardGrid summary={summary} />

          {/*
            Says out loud that these are admin numbers, counting pending and
            rejected rows. The public/admin split cost a real correction in
            Increment 8 (CLAUDE.md section D); an official reading "Listings
            submitted: 30" beside a catalogue of 23 deserves the explanation on
            the page rather than in a comment.
          */}
          <p className="text-sm text-muted">{t('admin.analytics.adminScopeNote')}</p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BarChartCard
              loading={loading}
              data={summary ? toCategoryBars(summary, page.data?.categories ?? []) : []}
            />
            <LineChartCard
              loading={loading}
              data={summary ? toCumulativeSeries(summary) : []}
            />
          </div>
        </>
      )}
    </section>
  )
}
