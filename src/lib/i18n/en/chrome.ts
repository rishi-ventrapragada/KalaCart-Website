/** Persistent chrome: the navbar, the theme toggle and the footer (PRD 11.0). */
export const chrome = {
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
    exploreHeading: 'Explore',
    credit: 'Smart India Hackathon 2026 - SIH26090',
    ministry: 'Ministry of Social Justice and Empowerment',
  },

  backToTop: {
    /* The visible label. The button carries text rather than a bare icon: an
       unlabelled arrow relies on the reader guessing, and it would need an
       aria-label saying this same word anyway. */
    label: 'Back to top',
  },
} as const
