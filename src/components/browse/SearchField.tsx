import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/Input'
import { useT } from '@/lib/i18n'

/** Long enough to skip intermediate keystrokes, short enough to feel live. */
const DEBOUNCE_MS = 300

interface SearchFieldProps {
  /** The committed value from the URL. */
  value: string
  /** Called with the debounced text; the caller writes it to the URL. */
  onCommit: (value: string) => void
  /**
   * Copy for surfaces other than Browse. Optional so Browse's own call is
   * unchanged; the admin artisan table searches people, not crafts, and a box
   * labelled "Search crafts" over a list of names would be wrong.
   */
  label?: string
  placeholder?: string
}

/**
 * The debounced text search (PRD 11.3).
 *
 * This is the ONE piece of local state in Browse. Everything else reads the URL
 * directly, but a text field cannot: writing every keystroke to the query
 * string would issue a seam read per character and push a history entry per
 * character. So the input holds its own text and commits on a pause.
 *
 * The URL still wins. `urlValue` is tracked alongside the text, so a change
 * arriving from outside - a back navigation, Clear filters, a pasted link -
 * is adopted during render rather than through an effect that would set state
 * a second time and re-render. React's own "adjusting state on prop change"
 * pattern, which is why there is no syncing effect here.
 */
export function SearchField({ value, onCommit, label, placeholder }: SearchFieldProps) {
  const [text, setText] = useState(value)
  const [urlValue, setUrlValue] = useState(value)

  if (value !== urlValue) {
    setUrlValue(value)
    setText(value)
  }

  useEffect(() => {
    // Already committed: nothing to debounce, and scheduling here would fire a
    // redundant write every time the URL round-trips back down.
    if (text === value) return

    const timer = window.setTimeout(() => {
      onCommit(text)
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
    // `onCommit` is intentionally omitted: the parent re-creates it on every
    // render, and depending on it would restart the timer each time so the
    // debounce would never fire. Its identity does not affect what is written.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, value])

  const t = useT()

  return (
    <Input
      label={label ?? t('browse.filters.search')}
      type="search"
      value={text}
      placeholder={placeholder ?? t('browse.filters.searchPlaceholder')}
      onChange={(event) => {
        setText(event.target.value)
      }}
    />
  )
}
