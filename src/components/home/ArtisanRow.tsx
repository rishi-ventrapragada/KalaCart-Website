import { ArtisanCard } from '@/components/home/ArtisanCard'
import { BounceFan } from '@/components/home/BounceFan'
import { SectionHeader } from '@/components/home/SectionHeader'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { getAllArtisans, getCategories } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

/**
 * Five, which is every approved artisan in the fixture pool.
 *
 * Was four - one clean row at every breakpoint - until the fan arrived in
 * Increment 18. A fan reads as a dealt hand, and an even count leaves no card
 * on the centre line, so it wants an odd number; five is also exactly what the
 * mock provider has approved, so nothing is silently withheld. Below `lg` the
 * grid still renders, at 2 columns then 5, so the odd count costs nothing.
 */
const FEATURED_COUNT = 5

/** Module scope so the reference is stable and useAsyncData does not refetch. */
const fetchApproved = () => getAllArtisans({ status: 'approved' })

/**
 * Featured artisans (PRD 11.2). Minimal cards, linking to each profile.
 *
 * Two reads rather than one joined call: the seam has no "artisan with
 * category" shape, and inventing one here would put a join in a component. The
 * category read is the same promise the rail already resolved, so it is warm.
 */
export function ArtisanRow() {
  const artisans = useAsyncData(fetchApproved)
  const categories = useAsyncData(getCategories)
  const t = useT()

  const failed = artisans.state === 'error' || categories.state === 'error'
  const loading = artisans.state === 'loading' || categories.state === 'loading'

  const featured = (artisans.data ?? []).slice(0, FEATURED_COUNT)

  const retry = (): void => {
    artisans.retry()
    categories.retry()
  }

  return (
    <section className="py-20 sm:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeader
          heading={t('home.artisans.heading')}
          body={t('home.artisans.body')}
          // The directory, not Browse. This pointed at /browse, which answered
          // "see all artisans" with a grid of products.
          linkTo="/artisans"
          linkLabel={t('home.artisans.seeAll')}
        />

        {failed ? (
          <ErrorState message={t('home.artisans.error')} onRetry={retry} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:h-[19rem] lg:grid-cols-5">
            {Array.from({ length: FEATURED_COUNT }, (_, i) => (
              // Same geometry as the real card, so nothing reflows on arrival.
              <Skeleton key={i} className="h-[13.5rem] rounded-card lg:h-full" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          /*
           * Added in Increment 16. This branch was missing: with no approved
           * artisans the section rendered its heading and "See all artisans"
           * over an empty grid, which reads as a broken layout rather than as
           * an empty catalogue. Matches ProductGrid (PRD 5.4, three states).
           */
          <EmptyState title={t('home.artisans.empty')} />
        ) : (
          <>
            {/*
              The fan from `lg` up, the grid below it. Both render the same
              links from the same read - this is one section with two
              presentations, not two sections. A fan is a pointer gesture: it
              needs hover to open and overlaps its own cards by design, so on a
              touch screen it would show five makers with three partly covered
              and no way to reveal them.
            */}
            <BounceFan
              artisans={featured}
              categories={categories.data ?? []}
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:hidden">
              {featured.map((artisan, i) => (
                <Reveal key={artisan.id} delay={i * 80}>
                  <ArtisanCard
                    artisan={artisan}
                    category={(categories.data ?? []).find((c) => c.id === artisan.categoryId)}
                  />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  )
}
