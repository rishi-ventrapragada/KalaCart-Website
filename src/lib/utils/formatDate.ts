/**
 * The submitted date on a queue row (PRD 11.6).
 *
 * Day-month-year with a short month name, `en-IN`: an all-numeric date is
 * ambiguous between the Indian and American orderings, and this desk is read
 * by a ministry official and built by people who may test it in either habit.
 * "12 Apr 2025" cannot be misread.
 */
const formatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string): string {
  const date = new Date(iso)
  // A malformed date must not take the row down with it: the queue still has
  // to render the item so a reviewer can act on it.
  if (Number.isNaN(date.getTime())) return ''
  return formatter.format(date)
}
