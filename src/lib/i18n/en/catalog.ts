/** Product detail (PRD 11.4) and artisan profile (PRD 11.5). */
export const catalog = {
  product: {
    /** {id} is replaced at call time. */
    by: 'Made by',
    description: 'About this piece',
    contact: 'Contact artisan',
    whatsapp: 'Message on WhatsApp',
    /** Prefilled into the WhatsApp draft. {title} is the product. */
    whatsappMessage: 'Hello, I saw "{title}" on KalaCart and would like to know more.',
    moreFrom: 'More from this artisan',
    galleryLabel: 'Product images',
    /** Announced when the gallery changes image. */
    galleryPosition: 'Image {current} of {total}',
    viewImage: 'View image {n}',
    notFoundTitle: 'That craft is no longer listed',
    notFoundBody: 'It may have been removed, or the link may be wrong.',
    backToBrowse: 'Browse all crafts',
    error: 'Could not load this craft.',
  },

  inquiry: {
    title: 'Contact the artisan',
    intro: 'Ask about materials, customisation, bulk orders or delivery.',
    name: 'Your name',
    nameHint: 'How the artisan should address you.',
    contact: 'Phone or email',
    contactHint: 'How they can reach you back.',
    message: 'Message',
    messagePlaceholder: 'What would you like to ask about this piece?',
    send: 'Send inquiry',
    sending: 'Sending',
    cancel: 'Cancel',
    /*
     * Deliberately honest about what actually happened. This build writes to an
     * in-memory mock that resets on reload, so "Your message has been sent"
     * would read as literally true to anyone seeing the site demoed, including
     * a reviewer with no way to know otherwise. The copy states what the demo
     * did and what the real thing will do, and claims nothing in between.
     */
    successTitle: 'Inquiry saved',
    successBody: 'In the full version this reaches the artisan directly.',
    failure: 'Could not save your inquiry. Your message is still here, try again.',
    errorName: 'Enter a name so the artisan knows who is asking.',
    errorContact: 'Enter a phone number or email so they can reply.',
    errorContactFormat: 'That does not look like a phone number or an email.',
    errorMessage: 'Write a short message about what you would like to know.',
  },

  artisan: {
    /** {count} is replaced at call time. */
    productCount: '{count} pieces listed',
    productCountOne: '1 piece listed',
    heading: 'Their work',
    /*
     * Not-found rather than a rejection notice. A buyer who lands on an
     * unapproved artisan is told the profile is not available, and nothing
     * more: whether someone was rejected, or is still waiting on review, is
     * the ministry's business and not a stranger's (PRD 11.5, Increment 11).
     */
    notFoundTitle: 'That artisan profile is not available',
    notFoundBody: 'It may have been removed, or the link may be wrong.',
    backToBrowse: 'Browse all crafts',
    emptyTitle: 'This artisan has not listed products yet',
    emptyBody: 'Their approved work will appear here once it is listed.',
    error: 'Could not load this artisan.',
  },
} as const
