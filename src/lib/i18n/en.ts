import { admin } from '@/lib/i18n/en/admin'
import { browse } from '@/lib/i18n/en/browse'
import { catalog } from '@/lib/i18n/en/catalog'
import { chrome } from '@/lib/i18n/en/chrome'
import { core } from '@/lib/i18n/en/core'
import { home } from '@/lib/i18n/en/home'
import { system } from '@/lib/i18n/en/system'

/**
 * THE ENGLISH DICTIONARY (PRD 7.4).
 *
 * One object, assembled from per-surface segments under `en/`. The split is
 * purely mechanical: this file is still the single source of truth the seam
 * contract names, `TranslationKey` is still derived from it, and a component
 * still calls `t('some.key')` knowing nothing about which segment a key lives
 * in. Splitting it keeps each file browsable as the app grows - a dictionary
 * that has to be scrolled past six unrelated surfaces to reach the seventh is
 * where stale and duplicated copy starts.
 *
 * `as const` on both the segments and this object is what makes the key union
 * literal rather than `string`, so a typo fails the build instead of rendering
 * blank. Adding a segment means importing it here and spreading it in; nothing
 * else changes.
 *
 * Copy follows CLAUDE.md: plain, active voice, sentence case. CTAs say what
 * happens. Errors explain what went wrong and how to fix it, without apology.
 * Empty states invite an action.
 */
export const en = {
  ...core,
  ...chrome,
  ...home,
  ...browse,
  ...catalog,
  ...admin,
  ...system,
} as const
