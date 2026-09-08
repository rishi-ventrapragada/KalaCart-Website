import { ArtisanCard } from '@/components/home/ArtisanCard'
import { SectionHeader } from '@/components/home/SectionHeader'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { getAllArtisans, getCategories } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

/** Four is one clean row at every breakpoint this design uses. */
const FEATURED_COUNT = 4

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
          linkTo="/browse"
          linkLabel={t('home.artisans.seeAll')}
        />

        {failed ? (
          <ErrorState message={t('home.artisans.error')} onRetry={retry} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: FEATURED_COUNT }, (_, i) => (
              // Same geometry as the real card, so nothing reflows on arrival.
              <Skeleton key={i} className="h-[13.5rem] rounded-card" />
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featured.map((artisan, i) => (
              <Reveal key={artisan.id} delay={i * 80}>
                <ArtisanCard
                  artisan={artisan}
                  category={(categories.data ?? []).find((c) => c.id === artisan.categoryId)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
