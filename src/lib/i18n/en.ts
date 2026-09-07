/**
 * The single English strings source (PRD 7.4).
 *
 * Every user-facing string in the app lives here, referenced by key. Adding
 * Hindi later is one new file typed as `Strings` - TypeScript then enumerates
 * every key that file is missing, so a language ships complete or not at all.
 *
 * Copy follows CLAUDE.md: plain, active voice, sentence case. CTAs say what
 * happens. Errors explain what went wrong and how to fix it, without apology.
 * Empty states invite an action.
 *
 * Keys cover what is on screen today. Later increments add their own sections
 * as those screens get built - writing copy against unbuilt UI would be guesses
 * that rot.
 */
export const en = {
  brand: {
    /** A proper name, not translated copy. Present so no component hardcodes it. */
    name: 'KalaCart',
  },

  common: {
    retry: 'Try again',
    loading: 'Loading',
    clearFilters: 'Clear filters',
  },

  nav: {
    home: 'Home',
    browse: 'Browse',
  },

  theme: {
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
  },

  home: {
    hero: {
      title: 'KalaCart',
      subtitle: 'Handmade goods, direct from Indian artisans.',
      cta: 'Browse crafts',
    },
    scaffoldNotice: 'Scaffold only. Theme is live; data, copy and motion arrive in later increments.',
  },

  browse: {
    title: 'Browse',
  },

  product: {
    /** {id} is replaced at call time; placeholder copy until Increment 10. */
    detailTitle: 'Product {id}',
  },

  artisan: {
    /** {id} is replaced at call time; placeholder copy until Increment 11. */
    profileTitle: 'Artisan {id}',
  },

  notFound: {
    title: 'Page not found',
  },
} as const
