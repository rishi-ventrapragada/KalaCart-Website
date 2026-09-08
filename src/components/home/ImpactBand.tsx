import { SectionHeader } from '@/components/home/SectionHeader'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { getAllArtisans, getAnalyticsSummary, getProducts } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

/**
 * The band counts what a BUYER can see, which is not what the admin summary
 * counts. `getAnalyticsSummary().totalProducts` is 30 because it includes
 * pending and rejected rows, while Browse shows the 23 approved ones - a public
 * band claiming 30 next to a catalogue of 23 is simply wrong.
 *
 * So products and traditions are counted from the buyer-facing reads, which
 * return approved rows only, and the summary is used just for the inquiry
 * total. Slower than one call; correct, which matters more on a number a
 * ministry page is asserting.
 */
const fetchPublicNumbers = async () => {
  const [summary, products, artisans] = await Promise.all([
    getAnalyticsSummary(),
    getProducts(),
    getAllArtisans({ status: 'approved' }),
  ])

  return {
    artisans: artisans.length,
    products: products.length,
    // Traditions actually represented by a listed craft, not the number of
    // categories the taxonomy happens to define.
    traditions: new Set(products.map((p) => p.categoryId)).size,
    inquiries: summary.totalInquiries,
  }
}

/**
 * The programme band (PRD 11.2's "quiet impact band").
 *
 * Every number here is counted from the data seam, never written by hand.
 * CLAUDE.md forbids invented statistics, and a hardcoded "500+ artisans" on a
 * government-programme page would be exactly that.
 *
 * The labels are also deliberately flat. Each says what was counted and stops:
 * "Artisans onboarded" is a fact about the platform, where anything like
 * "incomes raised" would claim an outcome this build cannot evidence.
 */
export function ImpactBand() {
  const summary = useAsyncData(fetchPublicNumbers)
  const t = useT()

  const stats =
    summary.data === null
      ? []
      : [
          { label: t('home.impact.artisans'), value: summary.data.artisans },
          { label: t('home.impact.products'), value: summary.data.products },
          { label: t('home.impact.crafts'), value: summary.data.traditions },
          { label: t('home.impact.inquiries'), value: summary.data.inquiries },
        ]

  return (
    <section className="py-20 sm:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeader heading={t('home.impact.heading')} />

        {summary.state === 'error' ? (
          <ErrorState message={t('home.impact.error')} onRetry={summary.retry} />
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {summary.state === 'loading'
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                ))
              : stats.map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 80}>
                    <div className="flex flex-col gap-1">
                      {/*
                        dd before dt in the markup would break the list's
                        semantics, so the visual order is set by flex-col-reverse
                        rather than by reordering the elements.
                      */}
                      <div className="flex flex-col-reverse gap-1">
                        <dt className="text-sm text-muted">{stat.label}</dt>
                        <dd className="font-display text-3xl leading-none text-ink">
                          {stat.value}
                        </dd>
                      </div>
                    </div>
                  </Reveal>
                ))}
          </dl>
        )}
      </Container>
    </section>
  )
}
