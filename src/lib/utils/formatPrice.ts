/**
 * Indian rupee, Indian digit grouping (1,20,000 not 120,000).
 *
 * `Intl` with the `en-IN` locale does the lakh/crore grouping correctly, which
 * hand-rolled formatting gets wrong. No decimals: craft prices are whole rupees
 * and trailing `.00` on a grid of cards is noise.
 */
const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const formatPrice = (paise: number): string => formatter.format(paise)
