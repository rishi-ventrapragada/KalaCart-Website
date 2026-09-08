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
    tagline: 'Market linkage for Indian artisans',
  },

  common: {
    retry: 'Try again',
    loading: 'Loading',
    clearFilters: 'Clear filters',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    dismiss: 'Dismiss',
    search: 'Search',
  },

  nav: {
    home: 'Home',
    browse: 'Browse',
    admin: 'Admin',
    searchPlaceholder: 'Search crafts',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    primary: 'Primary',
  },

  theme: {
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
  },

  footer: {
    programLine:
      'Connecting marginalised artisans to buyers, with no commission and no middlemen.',
    categoriesHeading: 'Crafts',
    exploreHeading: 'Explore',
    credit: 'Smart India Hackathon 2026 - SIH26090',
    ministry: 'Ministry of Social Justice and Empowerment',
  },

  ui: {
    modalLabel: 'Dialog',
    notifications: 'Notifications',
    selectPlaceholder: 'Choose an option',
    required: 'Required',
    optional: 'Optional',
  },

  home: {
    hero: {
      badge: 'Direct from the maker',
      /*
       * The headline ships as two keys, not one string the component splits.
       * PRD 10.4 masks each line separately, and where a line breaks is a
       * typographic decision per language: measuring a width to find the break
       * would put Hindi at the mercy of an English rhythm.
       */
      titleLineOne: 'Handmade goods,',
      /*
       * {accent} marks the word that carries the dye underline. It is a
       * placeholder rather than markup so a translator can move the emphasis to
       * whichever word carries it in their language.
       */
      titleLineTwo: 'direct from the {accent}.',
      accentWord: 'artisan',
      /** Screen readers get the headline as one sentence, unsplit. */
      titleLabel: 'Handmade goods, direct from the artisan.',
      subtitle:
        'Buy straight from the people who make it. No middlemen, no commission, and the full story of every craft.',
      cta: 'Browse crafts',
      /** Names the hero section for assistive technology. */
      sceneLabel: 'Introduction',
    },
    rail: {
      heading: 'Browse by craft',
      error: 'Could not load crafts. Reload the page to try again.',
    },
    artisans: {
      heading: 'Meet the makers',
      body: 'Verified artisans listing their own work, in their own words.',
      error: 'Could not load artisans.',
      seeAll: 'See all artisans',
    },
    products: {
      heading: 'Recently listed',
      body: 'New work from approved artisans across six crafts.',
      error: 'Could not load crafts.',
      seeAll: 'Browse all crafts',
      empty: 'No crafts are listed yet.',
    },
    impact: {
      heading: 'The programme so far',
      error: 'Could not load programme numbers.',
      /*
       * Labels state exactly what is counted, and nothing more. No outcome is
       * claimed - "artisans onboarded" is a fact about the platform, whereas
       * anything like "incomes raised" would be a claim this build cannot
       * support. CLAUDE.md forbids invented statistics.
       */
      artisans: 'Artisans onboarded',
      products: 'Crafts listed',
      crafts: 'Craft traditions',
      inquiries: 'Buyer inquiries sent',
    },
    closing: {
      title: 'Find the maker behind the craft.',
      body: 'Every listing links you straight to the artisan who made it.',
      cta: 'Browse crafts',
    },
    progressLabel: 'Reading progress',
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

  /**
   * Temporary. A development-only surface for reviewing every primitive in both
   * themes; not linked from the nav. Removed in the Increment 16 polish pass.
   */
  kitchenSink: {
    title: 'UI primitives',
    subtitle: 'Every primitive in every variant. Development only.',
    buttons: 'Buttons',
    forms: 'Form controls',
    feedback: 'Feedback',
    states: 'States',
    openModal: 'Open modal',
    openConfirm: 'Open confirm dialog',
    showToast: 'Show toast',
    modalTitle: 'A modal dialog',
    modalBody: 'Focus is trapped here. Press Escape or click outside to close.',
    confirmTitle: 'Reject this artisan?',
    confirmBody: 'They will be told the listing was not approved. You can change this later.',
    confirmAction: 'Reject artisan',
    toastMessage: 'Artisan approved.',
    emptyTitle: 'No crafts match these filters',
    emptyBody: 'Try widening the price range or clearing a filter.',
    sampleLabel: 'Buyer name',
    sampleHint: 'How the artisan should address you.',
    sampleError: 'Enter a name so the artisan knows who is asking.',
    sampleMessage: 'Message',
  },
} as const
