import { Skeleton } from '@/components/ui/Skeleton'

/** Enough cards to fill the fold without pretending to know the count. */
const SKELETON_COUNT = 6

/**
 * The loading state for the profile (PRD 5.4), extracted so the route stays
 * about behaviour rather than placeholder geometry.
 *
 * Every block matches the real element's size, so the page does not reflow
 * when the data lands - the circle is the portrait's size, the cards carry the
 * ProductCard's square cover.
 */
export function ArtisanProfileSkeleton() {
  return (
    <div className="flex flex-col gap-16">
      {/* Mirrors ArtisanHeader: name first, portrait and metadata beneath it. */}
      <div className="flex flex-col items-center gap-4 sm:items-start sm:gap-5">
        <Skeleton className="h-9 w-56" />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
          <Skeleton className="size-24 shrink-0 rounded-full sm:size-20" />
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Skeleton className="h-6 w-40 rounded-control" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-32" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-card" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
