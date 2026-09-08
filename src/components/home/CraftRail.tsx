import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useRailDrift } from '@/components/motion/useRailDrift'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { getCategories } from '@/lib/data'
import type { Category } from '@/lib/data'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

/** Tailwind cannot see a class built at runtime, so the dye map is explicit. */
const DYE_BORDER: Record<Category['dye'], string> = {
  indigo: 'border-indigo/45',
  madder: 'border-madder/45',
  marigold: 'border-marigold/45',
  brass: 'border-brass/45',
}

const DYE_DOT: Record<Category['dye'], string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
}

/**
 * THE CRAFT RAIL: the page's lateral move.
 *
 * A row of craft cards that travels sideways as the reader scrolls down. It is
 * the moment the page stops behaving like a document, and it doubles as the
 * browse-by-craft strip PRD 11.2 asks for.
 *
 * Data comes through the seam, never from a fixture, with loading and a
 * retryable error state (PRD 5.4). There is no empty branch: the categories are
 * the site's fixed taxonomy, so an empty result is a failure, not a state. The
 * dye tone lives in the card's border and dot, never in its label, per the
 * Increment 5 contrast resolution.
 */
export function CraftRail() {
  const rail = useRailDrift<HTMLDivElement>(0.85)
  const [result, setResult] = useState<{
    attempt: number
    state: 'loading' | 'error' | 'ready'
    categories: Category[]
  }>({ attempt: -1, state: 'loading', categories: [] })
  const t = useT()

  /*
   * Bumped to re-run the effect on retry. The effect owns the `live` flag that
   * guards against a late response landing after unmount, so re-entering it is
   * safer than calling a hoisted loader that would need its own guard.
   */
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let live = true

    getCategories()
      .then((result) => {
        if (!live) return
        setResult({ attempt, state: 'ready', categories: result })
      })
      .catch(() => {
        if (live) setResult({ attempt, state: 'error', categories: [] })
      })

    return () => {
      live = false
    }
  }, [attempt])

  /*
   * Loading is DERIVED, not set. Writing `setState('loading')` at the top of the
   * effect would start a second render pass on every run, which is exactly what
   * `useAsyncData` avoids by storing the attempt a result belongs to - a result
   * from an earlier attempt simply means this one is still in flight.
   */
  const settled = result.attempt === attempt
  const state = settled ? result.state : 'loading'
  const categories = settled ? result.categories : []

  if (state === 'error') {
    /*
     * A real retry, added in Increment 16. This branch used to render bare text
     * telling the reader to reload the whole page - the only error state on the
     * site without an action, and a contradiction of PRD 5.4, which requires a
     * retry on every one. The copy was changed to match.
     */
    return (
      <ErrorState
        message={t('home.rail.error')}
        onRetry={() => {
          setAttempt((n) => n + 1)
        }}
      />
    )
  }

  return (
    <div
      ref={rail}
      // Under reduced motion this becomes a real scroll region, so every card
      // stays reachable when the drift is switched off (PRD 10.7).
      className="craft-rail flex w-max gap-4 px-4 sm:px-6"
    >
      {state === 'loading'
        ? [0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[7.5rem] w-[15rem] rounded-card" />
          ))
        : categories.map((category) => (
            <Link
              key={category.id}
              to={`/browse?category=${category.slug}`}
              className={cn(
                'group flex h-[7.5rem] w-[15rem] shrink-0 flex-col justify-between',
                'rounded-card border bg-card p-4',
                'transition-colors duration-200 ease-site hover:border-accent',
                DYE_BORDER[category.dye],
              )}
            >
              <span className={cn('size-2 rounded-full', DYE_DOT[category.dye])} />
              <span className="font-display text-lg leading-tight text-ink">
                {category.name}
              </span>
            </Link>
          ))}
    </div>
  )
}
