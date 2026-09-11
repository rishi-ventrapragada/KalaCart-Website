import { useMemo } from 'react'

import { useDocumentTitle } from '@/app/useDocumentTitle'
import { ArtisanFilterBar } from '@/components/artisan/ArtisanFilterBar'
import { ArtisanGrid } from '@/components/artisan/ArtisanGrid'
import { Container } from '@/components/layout/Container'
import { getAllArtisans, getCategories } from '@/lib/data'
import type { Artisan, ArtisanFilters } from '@/lib/data'
import { useArtisanFilters } from '@/lib/artisans/useArtisanFilters'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

/**
 * Regions come from the artisans themselves, because the seam has no
 * getRegions() and an artisan's region IS the only place one is recorded. The
 * unfiltered read is deliberate: the region list must not shrink to whatever
 * the current filter left standing, or picking a region would remove every
 * other option and strand the reader. Same reasoning as Browse's facets read.
 */
const fetchFacets = async () => {
  const [categories, artisans] = await Promise.all([
    getCategories(),
    getAllArtisans({ status: 'approved' }),
  ])
  const regions = [...new Set(artisans.map((a) => a.region))].sort((a, b) => a.localeCompare(b))
  return { categories, regions }
}

/**
 * The artisans directory: every approved maker on one page (PRD 11.2).
 *
 * Home's "See all artisans" lands here. It used to point at /browse, which
 * answered a question about makers with a grid of products.
 *
 * The URL is the state, as on Browse: the three filters live in the query
 * string, so a filtered directory is shareable and the back button steps
 * through it. Motion is reveal-only (PRD 10.8) - no engine, no rail.
 */
export default function Artisans() {
  const state = useArtisanFilters()
  const t = useT()

  useDocumentTitle(undefined, 'meta.artisans')

  const facets = useAsyncData(fetchFacets)

  /*
   * The fetcher is re-created whenever the FILTERS change, and only then -
   * that identity change is what makes useAsyncData refetch. Keyed on a
   * serialization rather than the object, which useArtisanFilters rebuilds
   * each render: depending on it directly would refetch in a loop.
   */
  const filterKey = JSON.stringify(state.filters)

  const fetchArtisans = useMemo(() => {
    const filters = JSON.parse(filterKey) as ArtisanFilters
    return (): Promise<Artisan[]> => getAllArtisans(filters)
  }, [filterKey])

  const artisans = useAsyncData(fetchArtisans)

  const craftOptions = useMemo(
    () => (facets.data?.categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    [facets.data],
  )
  const regionOptions = useMemo(
    () => (facets.data?.regions ?? []).map((r) => ({ value: r, label: r })),
    [facets.data],
  )

  const retry = (): void => {
    artisans.retry()
    facets.retry()
  }

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl">{t('artisans.title')}</h1>
        <p className="max-w-xl text-sm text-muted sm:text-base">{t('artisans.subtitle')}</p>
      </div>

      {/*
        Labelled rather than sr-only-headed like Browse's aside: this is a row
        of controls, not a landmark a reader would want to jump to, and the
        heading exists only so the region is named.
      */}
      <section aria-labelledby="artisan-filters-heading">
        <h2 id="artisan-filters-heading" className="sr-only">
          {t('artisans.filters.heading')}
        </h2>
        <ArtisanFilterBar state={state} crafts={craftOptions} regions={regionOptions} />
      </section>

      <ArtisanGrid
        // A failed facets read leaves the filter selects empty but the
        // directory itself readable, so only the artisans read decides this.
        state={artisans.state}
        artisans={artisans.data ?? []}
        categories={facets.data?.categories ?? []}
        filtered={state.active}
        onRetry={retry}
        onClear={state.clearAll}
      />
    </Container>
  )
}
