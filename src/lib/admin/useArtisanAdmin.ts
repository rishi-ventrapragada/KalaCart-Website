import { useCallback, useMemo, useState } from 'react'

import { setArtisanStatus } from '@/lib/data'
import type { Artisan, Status } from '@/lib/data'

interface UseArtisanAdminOptions {
  /** The rows as last read from the seam. */
  artisans: Artisan[]
  onChanged: (name: string, status: Status) => void
  onFailed: (name: string) => void
}

interface UseArtisanAdminResult {
  /** The rows with any optimistic status change applied. */
  rows: Artisan[]
  /** True while that row's write is in flight; the row disables its actions. */
  isPending: (id: string) => boolean
  setStatus: (artisan: Artisan, status: Status) => void
}

/**
 * Optimistic status changes for the artisan table (PRD 11.7), with the same
 * rollback contract as the queue's useQueue.
 *
 * The difference is what optimism means on this surface. In the queue a row
 * LEAVES; here it stays and its badge changes, because this table shows every
 * artisan in whatever state they are in. So the override is a status per id
 * rather than a set of removed ids, and a failure restores the previous status
 * rather than restoring a row.
 *
 * The rollback matters for the same reason it did there: a badge that says
 * "approved" after a write that failed tells a ministry official their decision
 * was recorded when it was not.
 *
 * Overrides are keyed by id and layered over whatever the seam last returned,
 * so a refetch triggered by a filter change does not revert a change the
 * reviewer just made and is still looking at.
 */
export function useArtisanAdmin({
  artisans,
  onChanged,
  onFailed,
}: UseArtisanAdminOptions): UseArtisanAdminResult {
  const [overrides, setOverrides] = useState<Map<string, Status>>(() => new Map())
  const [inFlight, setInFlight] = useState<Set<string>>(() => new Set())

  const setStatus = useCallback(
    (artisan: Artisan, status: Status) => {
      const previous = artisan.status
      const name = artisan.name

      setOverrides((current) => new Map(current).set(artisan.id, status))
      setInFlight((current) => new Set(current).add(artisan.id))

      void setArtisanStatus(artisan.id, status)
        .then(() => {
          onChanged(name, status)
        })
        .catch(() => {
          // Put the old status back. The decision did not stick, and the desk
          // has to show that rather than quietly swallowing it.
          setOverrides((current) => new Map(current).set(artisan.id, previous))
          onFailed(name)
        })
        .finally(() => {
          setInFlight((current) => {
            const next = new Set(current)
            next.delete(artisan.id)
            return next
          })
        })
    },
    [onChanged, onFailed],
  )

  const rows = useMemo(
    () =>
      artisans.map((artisan) => {
        const override = overrides.get(artisan.id)
        return override && override !== artisan.status
          ? { ...artisan, status: override }
          : artisan
      }),
    [artisans, overrides],
  )

  const isPending = useCallback((id: string) => inFlight.has(id), [inFlight])

  return { rows, isPending, setStatus }
}
