import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useRailDrift } from '@/components/motion/useRailDrift'
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
 * Data comes through the seam, never from a fixture, and all three states are
 * handled (PRD 5.4). The dye tone lives in the card's border and dot, never in
 * its label, per the Increment 5 contrast resolution.
 */
export function CraftRail() {
  const rail = useRailDrift<HTMLDivElement>(0.85)
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading')
  const [categories, setCategories] = useState<Category[]>([])
  const t = useT()

  useEffect(() => {
    let live = true

    const load = (): void => {
      setState('loading')
      getCategories()
        .then((result) => {
          if (!live) return
          setCategories(result)
          setState('ready')
        })
        .catch(() => {
          if (live) setState('error')
        })
    }

    load()
    return () => {
      live = false
    }
  }, [])

  if (state === 'error') {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-muted">{t('home.rail.error')}</p>
      </div>
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
