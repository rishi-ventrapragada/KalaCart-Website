/**
 * The admin desk: the mock auth gate and the shared admin frame (PRD 11.1).
 *
 * Everything here nests under a single `admin` key rather than contributing
 * top-level groups. The dictionary is assembled by spreading the segments
 * together, so a second top-level `nav` would silently replace the navbar's -
 * `t('nav.browse')` would resolve to undefined and render blank. One namespace
 * keeps the admin surface from colliding with the buyer chrome.
 */
export const admin = {
  admin: {
    auth: {
      title: 'Admin sign-in',
      intro: 'For the verification desk and the artisan records.',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign in',
      signOut: 'Sign out',
      errorEmail: 'Enter the email address.',
      errorPassword: 'Enter the password.',
      /*
       * One message for a wrong email and a wrong password together. Saying
       * which half was wrong is how a real login leaks whether an account
       * exists; this gate is a demo, but the copy should not teach the habit.
       */
      errorCredential: 'That email and password do not match the demo credential below.',
      signedOut: 'Signed out.',
    },

    /*
     * The on-screen disclosure (PRD 11.1: "do not present it as real
     * security").
     *
     * The credential ships in the public bundle and the flag can be set from
     * the console, so a screen that looks like a real login would be claiming
     * a protection that does not exist. A reviewer sees this page, not the
     * source, so the page is where the truth has to be. Printing the
     * credential is also simply how a demo should behave: nobody should have
     * to read the repository to open the admin desk.
     */
    mock: {
      heading: 'Demonstration gate, not real security',
      body: 'This build has no backend. The credential below is in the public code and anyone can sign in with it. Real email and password sign-in arrives with Supabase.',
      credentialLabel: 'Use',
      /*
       * The second clause was added in Increment 13. Approvals and rejections
       * write to an in-memory store that resets on reload, so a reviewer who
       * approves an artisan, refreshes, and finds them waiting again would
       * otherwise reasonably conclude the desk had lost their decision. The
       * banner is the one place that already carries what this build really
       * is, so the caveat goes here rather than onto every row.
       */
      bannerShort:
        'Mock sign-in. Anyone with the demo credential can reach this desk, and approvals reset when the page reloads.',
    },

    nav: {
      label: 'Admin',
      queue: 'Verification queue',
      artisans: 'Artisans',
      analytics: 'Analytics',
      backToSite: 'Back to site',
    },

    queue: {
      title: 'Verification queue',
      intro: 'Approve or reject what artisans have submitted.',
      tabArtisans: 'Artisans',
      tabProducts: 'Products',
      /** {count} is replaced at call time. */
      pendingCount: '{count} waiting',
      approve: 'Approve',
      reject: 'Reject',
      preview: 'Preview',
      submitted: 'Submitted {date}',
      /*
       * PRD 11.6 asks for this exact sentiment: the desk being clear is good
       * news, not an absence, so the copy says so rather than reporting a
       * count of zero.
       */
      emptyArtisans: 'Nothing waiting for review, you are all caught up',
      emptyProducts: 'No products waiting for review, you are all caught up',
      error: 'Could not load the queue.',
      confirmArtisanTitle: 'Reject this artisan?',
      confirmArtisanBody:
        'They will not appear to buyers. You can change this later from the artisan records.',
      confirmProductTitle: 'Reject this listing?',
      confirmProductBody:
        'It will not appear to buyers. You can change this later from the artisan records.',
      confirmReject: 'Reject',
      approvedToast: '{name} approved.',
      rejectedToast: '{name} rejected.',
      /*
       * The failure toast names the row and says the change did not save,
       * because the row reappearing is otherwise indistinguishable from a
       * misclick. A moderation desk that silently loses a decision is worse
       * than one that refuses it loudly.
       */
      failedToast: 'Could not save that change. {name} is still waiting for review.',
      previewRegion: 'Region',
      previewCraft: 'Craft',
      previewPrice: 'Price',
      previewSubmitted: 'Submitted',
      previewDescription: 'Description',
      previewArtisan: 'Artisan',
      previewPhone: 'Phone',
    },

    artisans: {
      title: 'Artisans',
      intro: 'Every artisan on the platform, and what buyers can see of them.',
      search: 'Search artisans',
      searchPlaceholder: 'Name or region',
      filterStatus: 'Status',
      filterCategory: 'Craft',
      filterRegion: 'Region',
      allStatuses: 'Any status',
      allCategories: 'Any craft',
      allRegions: 'Anywhere',
      clear: 'Clear filters',
      /** {count} is replaced at call time. */
      count: '{count} artisans',
      countOne: '1 artisan',
      colArtisan: 'Artisan',
      colCraft: 'Craft',
      colRegion: 'Region',
      colStatus: 'Status',
      colProducts: 'Listings',
      colActions: 'Actions',
      /** {count} is replaced at call time. */
      productCount: '{count} listed',
      statusPending: 'Pending',
      statusApproved: 'Approved',
      statusRejected: 'Rejected',
      approve: 'Approve',
      reject: 'Reject',
      reinstate: 'Reinstate',
      emptyTitle: 'No artisans match these filters',
      emptyBody: 'Try a different status or region, or clear the filters.',
      error: 'Could not load the artisan records.',
      /*
       * The two confirms name the CONSEQUENCE to buyers, not the database
       * change. "Set status to rejected" tells an official nothing about what
       * they are actually doing to a real person's shopfront.
       */
      confirmApproveTitle: 'Publish this artisan?',
      confirmApproveBody:
        'Their profile and approved listings become visible to buyers straight away.',
      confirmApproveAction: 'Approve',
      confirmRemoveTitle: 'Remove this artisan from the site?',
      confirmRemoveBody:
        'Their profile stops being visible to buyers, including anyone holding a link to it. You can reinstate them later.',
      confirmRemoveAction: 'Remove',
      changedApproved: '{name} is now visible to buyers.',
      changedRejected: '{name} is no longer visible to buyers.',
      changedPending: '{name} is back in the review queue.',
      failedToast: 'Could not save that change. {name} is unchanged.',
    },

    analytics: {
      title: 'Analytics',
      intro: 'The programme in numbers, across every artisan on the platform.',

      /*
       * Card labels name the ADMIN scope out loud. `totalProducts` counts
       * pending and rejected listings too, so a bare "Listings" beside a
       * catalogue showing fewer would read as a contradiction - the same trap
       * the Home impact band avoided in Increment 8 (CLAUDE.md section D).
       */
      totalArtisans: 'Artisans registered',
      approvedArtisans: 'Visible to buyers',
      pendingArtisans: 'Awaiting review',
      totalProducts: 'Listings submitted',
      totalInquiries: 'Buyer inquiries',
      adminScopeNote:
        'Every figure here counts all submissions, including those pending and rejected. Buyers see only approved artisans and listings.',

      byCategoryTitle: 'Artisans by craft',
      byCategoryCaption: 'Where the platform is strong, and where it needs outreach.',
      byCategoryColLabel: 'Craft',
      byCategoryColValue: 'Artisans',

      /*
       * The heading says "on the platform", not "signups", because the line is
       * the running total rather than the monthly figure - a chart titled
       * signups showing 9 at the right edge would be off by a factor of nine.
       */
      overTimeTitle: 'Artisans on the platform',
      overTimeCaption: 'Cumulative total by month, since the first registration.',
      overTimeColMonth: 'Month',
      overTimeColAdded: 'Joined',
      overTimeColTotal: 'Total',

      /** Names the table that carries each chart's numbers for a screen reader. */
      tableLabel: '{title}, as a table',

      error: 'Could not load the analytics.',
    },
  },
} as const
