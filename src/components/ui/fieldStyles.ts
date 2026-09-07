/**
 * Shared field appearance for Input, Textarea and Select.
 *
 * Soft rounded rect, not a capsule: the PRD 9.5 binary calls text fields
 * containers rather than controls, and a capsule text box reads wrong.
 */
export const fieldBase =
  'w-full rounded-card border bg-card px-3 py-2 text-sm text-ink ' +
  'placeholder:text-muted transition-colors duration-200 ease-site ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

export const fieldBorder = (invalid: boolean): string =>
  invalid ? 'border-secondary' : 'border-line-strong hover:border-accent'

export const labelStyles = 'block text-sm font-medium text-ink'
export const hintStyles = 'text-xs text-muted'
export const errorStyles = 'text-xs text-secondary'
