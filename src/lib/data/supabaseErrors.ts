import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Turns a PostgREST failure into an error that names its own cause.
 *
 * THE CASE THIS EXISTS FOR: the queue's writes succeed today only because RLS
 * on `products`, `sellers` and `profiles` is wide open — the permissive `*_all`
 * policies recorded in memory/decisions.md (2026-09-11). The teammate is
 * replacing those with scoped policies built on `current_seller_id()`. When
 * that lands, this provider starts failing, because it authenticates with the
 * publishable key alone and carries no user JWT: `auth.uid()` is null for every
 * request it makes.
 *
 * The failure mode is what makes this worth a file. A policy denial is not an
 * error — PostgREST returns 200 and an EMPTY ARRAY on a blocked select, and
 * 0 rows affected on a blocked update. The queue would simply go quiet: no
 * pending rows, approvals that appear to work and change nothing. Without the
 * checks below that reads as "the queue is broken" and costs an afternoon.
 *
 * So: writes assert that a row came back, and both paths label an RLS denial
 * explicitly. `PGRST301` / 42501 are the loud forms; the silent form is caught
 * by `expectRows`.
 */

const RLS_HINT =
  'This is what an RLS policy change looks like from here: the queue holds only ' +
  'the publishable key and no user JWT, so auth.uid() is null for its requests. ' +
  'If the seller policies have been narrowed to current_seller_id(), the admin ' +
  'queue needs a real signed-in admin session — see memory/decisions.md, ' +
  '2026-09-12 entry.'

export function isRlsDenial(error: PostgrestError): boolean {
  return (
    error.code === 'PGRST301' ||
    error.code === '42501' ||
    /row-level security|permission denied/i.test(error.message)
  )
}

/** Throw a labelled error for a failed read or write. */
export function raise(operation: string, error: PostgrestError): never {
  if (isRlsDenial(error)) {
    throw new Error(`${operation} was blocked by row-level security. ${RLS_HINT}`)
  }
  throw new Error(`${operation} failed: ${error.message} (${error.code})`)
}

/**
 * Assert that a write actually touched a row.
 *
 * A `.select()` on an update returns the changed rows, so an empty result means
 * either the id does not exist or a policy silently filtered it — the quiet
 * failure described above. Treating it as an error is the whole point: the
 * queue's optimistic UI rolls the row back on a rejected promise, so a denial
 * that throws is shown to the reviewer, while one that resolves is not.
 */
export function expectRows<T>(operation: string, rows: T[] | null, id: string): void {
  if (!rows || rows.length === 0) {
    throw new Error(
      `${operation} changed no rows for id ${id}. Either the row does not exist, ` +
        `or a policy filtered it out. ${RLS_HINT}`,
    )
  }
}
