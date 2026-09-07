import { en } from '@/lib/i18n/en'
import type { Interpolations, TranslationKey } from '@/lib/i18n/types'

/**
 * THE i18n SEAM (PRD 7.4).
 *
 * Components call `t('some.key')` and never hold a literal. One language today;
 * adding Hindi is a new file plus a swap here, not a refactor.
 */
const strings: Record<string, unknown> = en

/** Replaces {placeholders} with the values given. */
function interpolate(template: string, values?: Interpolations): string {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * Look up a string by dot path, at any nesting depth. The key is type-checked
 * against the dictionary, so a typo or a removed key breaks the build rather
 * than rendering blank.
 */
export function t(key: TranslationKey, values?: Interpolations): string {
  let current: unknown = strings

  for (const segment of key.split('.')) {
    if (typeof current !== 'object' || current === null) {
      current = undefined
      break
    }
    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current !== 'string') {
    // Unreachable while the key type holds; guards against a malformed file.
    return key
  }

  return interpolate(current, values)
}

/**
 * The hook components use. A hook rather than the bare function so a later
 * language switcher can add context without touching a single call site.
 */
export function useT(): typeof t {
  return t
}
