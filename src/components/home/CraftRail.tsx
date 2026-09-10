import { useEffect, useState } from 'react'

import { CraftCard } from '@/components/home/CraftCard'
import { useMarqueeLoop } from '@/components/motion/useMarqueeLoop'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { getCategories } from '@/lib/data'
import type { Category } from '@/lib/data'
import { useT } from '@/lib/i18n'

/**
 * THE CRAFT RAIL: a continuous band of craft cards.
 *
 * The row loops leftward forever and pauses under the cursor, so the reader can
 * stop it on the craft they want rather than chasing it. It doubles as the
 * browse-by-craft strip PRD 11.2 asks for.
 *
 * It used to be Home's SCROLL-DRIVEN lateral move (`useRailDrift`). That is now
 * retired for this section: a scroll-linked transform and a continuous animation
 * would both be writing lateral position to the same element and would fight
 * every frame. Home keeps its other scroll-linked moments (the hero spiral, the
 * maker fan). See CLAUDE.md D, 2026-09-11.
 *
 * Data comes through the seam, never from a fixture, with loading and a
 * retryable error state (PRD 5.4). There is no empty branch: the categories are
 * the site's fixed taxonomy, so an empty result is a failure, not a state.
 */
export function CraftRail() {
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

  // Re-measured whenever the card set changes, so the cycle length always
  // matches what is actually on the rail.
  const { ref, duration } = useMarqueeLoop<HTMLDivElement>(categories.length)

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

  if (state === 'loading') {
    return (
      <div className="flex justify-center gap-5 overflow-hidden px-4 sm:px-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[8.5rem] w-[15rem] shrink-0 rounded-card" />
        ))}
      </div>
    )
  }

  /*
   * The track is rendered TWICE. The loop translates by exactly -50%, which is
   * one full copy, so the moment it wraps back to zero the second copy is
   * sitting precisely where the first was and the seam is invisible. One copy
   * cannot do this: it would run out and leave a gap before it reset.
   *
   * Only the first copy is reachable - the duplicate is aria-hidden and out of
   * the tab order, so assistive technology hears each craft once.
   *
   * Under reduced motion `duration` is null: no animation is applied at all and
   * the CSS turns the rail into a hand-scrollable region (PRD 10.7).
   */
  return (
    <div className="craft-rail-viewport" data-paused={duration === null || undefined}>
      <div
        className="craft-rail"
        style={duration === null ? undefined : { animationDuration: `${String(duration)}s` }}
      >
        <div ref={ref} className="craft-rail__track">
          {categories.map((category) => (
            <CraftCard key={category.id} category={category} />
          ))}
        </div>

        {duration !== null && (
          <div className="craft-rail__track" aria-hidden>
            {categories.map((category) => (
              <CraftCard key={`echo-${category.id}`} category={category} decorative />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
