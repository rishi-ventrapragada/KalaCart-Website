/**
 * A wa.me link for an artisan, or null when the number cannot make one.
 *
 * wa.me wants digits only: no `+`, no spaces, no punctuation. The mock stores
 * numbers as `+919876543201`, and real Supabase rows will arrive in whatever
 * shape the mobile app wrote them, so the digits are extracted rather than
 * assumed.
 *
 * Returning null rather than a best-effort link is deliberate. A malformed
 * wa.me URL opens WhatsApp on a "phone number is invalid" screen, which reads
 * as the site being broken; a missing button reads as a contact method this
 * artisan has not given. The caller omits the button when this returns null.
 */

/** E.164 allows 8-15 digits. Anything outside that cannot be a real number. */
const MIN_DIGITS = 8
const MAX_DIGITS = 15

/** Numbers stored without a country code are Indian; wa.me requires one. */
const DEFAULT_COUNTRY_CODE = '91'
const INDIAN_NATIONAL_LENGTH = 10

export function buildWhatsappLink(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null

  // A bare 10-digit number is a national Indian one: prefix it, or wa.me reads
  // the first digits as a country code and opens a number in another country.
  const withCode =
    digits.length === INDIAN_NATIONAL_LENGTH ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits

  return `https://wa.me/${withCode}?text=${encodeURIComponent(message)}`
}
