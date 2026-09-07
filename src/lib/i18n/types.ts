import type { en } from '@/lib/i18n/en'

/** A dictionary is strings, nested to any depth. */
export interface StringTree {
  readonly [key: string]: string | StringTree
}

/**
 * The shape every language file must satisfy. A Hindi file typed as `Strings`
 * fails to compile until every key is present and every leaf is a string, so a
 * language cannot ship half translated (PRD 7.4: adding one is a new file, not
 * a refactor).
 */
export type Strings = {
  readonly [K in keyof typeof en]: (typeof en)[K] extends string
    ? string
    : { readonly [P in keyof (typeof en)[K]]: (typeof en)[K][P] extends string ? string : StringTree }
}

/**
 * Flattens the nested dictionary into the union of its dot paths, so
 * `t('home.hero.title')` type-checks and `t('home.hero.titel')` does not.
 */
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`
}[keyof T & string]

export type TranslationKey = Paths<typeof en>

/** Values substituted into a string containing {placeholders}. */
export type Interpolations = Record<string, string | number>
