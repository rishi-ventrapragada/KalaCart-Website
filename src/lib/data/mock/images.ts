/**
 * Deterministic placeholder imagery: a given product shows the same gallery on
 * every load, without checking any assets into the repo. Replaced by real
 * Supabase Storage URLs when the backend is wired (PRD section 16, question 4).
 */

export const img = (seed: string, n: number): string =>
  `https://picsum.photos/seed/kala-${seed}-${n}/800/800`

/** PRD section 8 requires 3 to 5 gallery images per product. */
export const gallery = (seed: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => img(seed, i + 1))
