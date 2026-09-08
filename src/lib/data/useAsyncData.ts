import { useCallback, useEffect, useState } from 'react'

/** The three states every data view must handle (PRD 5.4). */
export type AsyncState = 'loading' | 'error' | 'ready'

interface AsyncResult<T> {
  state: AsyncState
  data: T | null
  /** Re-runs the fetch. Wired to the retry button in every error state. */
  retry: () => void
}

/**
 * Runs one data-seam read and tracks its three states.
 *
 * Extracted because every section on Home was about to hand-roll the same
 * effect, the same live-flag guard against setting state after unmount, and the
 * same retry. One copy means a fix to the cancellation logic fixes every
 * caller, and a section is left describing only what it renders.
 *
 * `fetcher` must be stable, or this refetches on every render. Callers pass a
 * module-scope seam function (`getCategories`) or wrap in useCallback.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>): AsyncResult<T> {
  const [attempt, setAttempt] = useState(0)
  /*
   * One state object rather than three, and it carries the attempt it belongs
   * to. A retry has to return the view to `loading` without an extra
   * setState at the top of the effect: setting state synchronously there
   * triggers a second render pass every time the effect runs. Comparing the
   * stored attempt against the current one derives `loading` during render
   * instead, which is the same information for free.
   */
  const [result, setResult] = useState<{ attempt: number; state: AsyncState; data: T | null }>({
    attempt: -1,
    state: 'loading',
    data: null,
  })

  const retry = useCallback(() => {
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    let live = true

    fetcher()
      .then((data) => {
        if (live) setResult({ attempt, state: 'ready', data })
      })
      .catch(() => {
        // The seam's error is not surfaced: PRD copy rules want an explanation
        // the reader can act on, not a provider's message. The retry is the
        // action, and it lives in the i18n strings with the rest of the copy.
        if (live) setResult({ attempt, state: 'error', data: null })
      })

    return () => {
      live = false
    }
  }, [fetcher, attempt])

  // A result from an earlier attempt is stale, so this read is still loading.
  const settled = result.attempt === attempt

  return {
    state: settled ? result.state : 'loading',
    data: settled ? result.data : null,
    retry,
  }
}
