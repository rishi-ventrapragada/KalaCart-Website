/**
 * Shared field appearance for Input, Textarea and Select.
 *
 * Soft rounded rect, not a capsule: the PRD 9.5 binary calls text fields
 * containers rather than controls, and a capsule text box reads wrong.
 */
export const fieldBase =
  'w-full rounded-card border bg-card px-3.5 py-2.5 text-sm text-ink ' +
  'placeholder:text-muted ' +
  'transition-[border-color,background-color] duration-200 ease-site ' +
  'disabled:cursor-not-allowed disabled:opacity-45'

export const fieldBorder = (invalid: boolean): string =>
  invalid ? 'border-secondary' : 'border-line-strong hover:border-accent'

export const labelStyles = 'block text-sm font-medium tracking-[-0.005em] text-ink'
export const hintStyles = 'text-xs leading-relaxed text-muted'
/**
 * `ink`, not `secondary`. The secondary tone measured 3.24:1 on light card and
 * 2.69:1 on dark, both under AA for text (Increment 5). The invalid state is
 * carried by the field's border instead, which is where a non-text colour
 * belongs.
 */
export const errorStyles = 'text-xs font-medium leading-relaxed text-ink'
