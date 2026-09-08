import type { TranslationKey } from '@/lib/i18n/types'

export interface InquiryDraft {
  buyerName: string
  buyerContact: string
  message: string
}

export type InquiryErrors = Partial<Record<keyof InquiryDraft, TranslationKey>>

/** A message shorter than this is not a question an artisan can answer. */
const MIN_MESSAGE = 10

/**
 * Loose on purpose. A contact is usable if it looks like an email or holds
 * enough digits to be a phone number; anything stricter starts rejecting real
 * people. Indian numbers arrive with and without +91, with spaces and hyphens,
 * and a regex tuned to one shape refuses the rest.
 */
function contactLooksUsable(value: string): boolean {
  if (value.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  return value.replace(/\D/g, '').length >= 8
}

/** Returns errors as translation keys, so this file holds no user-facing copy. */
export function validateInquiry(draft: InquiryDraft): InquiryErrors {
  const errors: InquiryErrors = {}

  if (!draft.buyerName.trim()) errors.buyerName = 'inquiry.errorName'

  if (!draft.buyerContact.trim()) errors.buyerContact = 'inquiry.errorContact'
  else if (!contactLooksUsable(draft.buyerContact.trim())) {
    errors.buyerContact = 'inquiry.errorContactFormat'
  }

  if (draft.message.trim().length < MIN_MESSAGE) errors.message = 'inquiry.errorMessage'

  return errors
}
