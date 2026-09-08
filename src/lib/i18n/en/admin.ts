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
      bannerShort: 'Mock sign-in. Anyone with the demo credential can reach this desk.',
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
      previewTitle: 'Details',
      previewRegion: 'Region',
      previewCraft: 'Craft',
      previewPrice: 'Price',
      previewSubmitted: 'Submitted',
      previewDescription: 'Description',
      previewArtisan: 'Artisan',
      previewPhone: 'Phone',
      previewImages: 'Images',
    },

    /*
     * Placeholder surfaces. The artisan table and the analytics charts are
     * Increments 14 and 15; each tab says which increment fills it rather than
     * showing an empty panel that looks broken.
     */
    placeholder: {
      artisansTitle: 'Artisans',
      artisansBody: 'The searchable artisan table is built in Increment 14.',
      analyticsTitle: 'Analytics',
      analyticsBody: 'Stat cards and charts are built in Increment 15.',
    },
  },
} as const
