import { useCallback, useMemo, useState } from 'react'

import type { Status } from '@/lib/data'

/** Anything the queue can act on. Both kinds of row carry an id. */
interface QueueItem {
  id: string
}

interface UseQueueOptions<T extends QueueItem> {
  /** The pending rows as last read from the seam. */
  items: T[]
  /** The seam's status setter for this kind of row. */
  setStatus: (id: string, status: Status) => Promise<void>
  /** How a row names itself in a toast. */
  label: (item: T) => string
  onApproved: (name: string) => void
  onRejected: (name: string) => void
  onFailed: (name: string) => void
}

interface UseQueueResult<T extends QueueItem> {
  /** `items` minus anything removed optimistically. What the list renders. */
  visible: T[]
  /** True while that row's write is in flight; the row disables its actions. */
  isPending: (id: string) => boolean
  approve: (item: T) => void
  reject: (item: T) => void
}

/**
 * The optimistic approve/reject behaviour for one queue tab (PRD 11.6).
 *
 * The row leaves the list the moment it is acted on, so the desk feels
 * immediate. THE ROLLBACK IS THE POINT: if the write then fails, the row comes
 * back and a toast says the change did not save.
 *
 * Removing the row and leaving it removed on failure would tell a reviewer they
 * approved someone who is in fact still pending - the same class of lie the
 * Increment 10 inquiry toast was written to avoid, except here it corrupts an
 * official's record of their own decisions rather than a buyer's expectations.
 *
 * Removal is tracked as a set of ids rather than a copied array, so a refetch
 * that brings back a fresh `items` list does not resurrect rows the reviewer
 * has already cleared.
 *
 * This hook is called by the queue ROUTE, not by the tab components, so the
 * visible rows are known one level above the tabs. A tab reporting its own
 * count upward would be setting parent state during render, and the tab badges
 * need that count too.
 */
export function useQueue<T extends QueueItem>({
  items,
  setStatus,
  label,
  onApproved,
  onRejected,
  onFailed,
}: UseQueueOptions<T>): UseQueueResult<T> {
  const [removed, setRemoved] = useState<Set<string>>(() => new Set())
  const [inFlight, setInFlight] = useState<Set<string>>(() => new Set())

  const act = useCallback(
    (item: T, status: Status) => {
      const name = label(item)

      // Optimistic: out of the list now, and marked in flight so a double
      // click cannot fire the write twice.
      setRemoved((current) => new Set(current).add(item.id))
      setInFlight((current) => new Set(current).add(item.id))

      void setStatus(item.id, status)
        .then(() => {
          if (status === 'approved') onApproved(name)
          else onRejected(name)
        })
        .catch(() => {
          // Put it back. The reviewer's decision did not stick, and the desk
          // has to show that rather than quietly swallowing it.
          setRemoved((current) => {
            const next = new Set(current)
            next.delete(item.id)
            return next
          })
          onFailed(name)
        })
        .finally(() => {
          setInFlight((current) => {
            const next = new Set(current)
            next.delete(item.id)
            return next
          })
        })
    },
    [label, setStatus, onApproved, onRejected, onFailed],
  )

  const approve = useCallback(
    (item: T) => {
      act(item, 'approved')
    },
    [act],
  )

  const reject = useCallback(
    (item: T) => {
      act(item, 'rejected')
    },
    [act],
  )

  const isPending = useCallback((id: string) => inFlight.has(id), [inFlight])

  const visible = useMemo(
    () => items.filter((item) => !removed.has(item.id)),
    [items, removed],
  )

  return { visible, isPending, approve, reject }
}
