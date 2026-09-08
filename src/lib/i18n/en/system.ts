/** Everything not a product surface: the 404, and the dev-only kitchen sink. */
export const system = {
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
