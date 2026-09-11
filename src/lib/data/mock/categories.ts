import type { Category } from '@/lib/data/types'

/**
 * The craft taxonomy, taken from the real Supabase `categories` table rather
 * than invented here. Names and icons are exactly what the live rows carry, so
 * the mock and the backend name the same crafts.
 *
 * THREE DELIBERATE DIVERGENCES from the live table, all recorded in CLAUDE.md
 * section D. The table holds twelve rows; this holds nine.
 *
 * 1. Two rows are duplicates from a second seed run. "Bamboo Craft" (inserted
 *    54 minutes after "Bamboo") and "Textiles" (after "Handloom") are the same
 *    crafts under different strings, which the table's UNIQUE constraint on
 *    `name` cannot catch. They collapse into their originals here. Shipping
 *    both would put two Bamboo cards in the craft rail and two Bamboo options
 *    in every category filter, which reads as a bug rather than a taxonomy.
 *
 * 2. "Home Decor" is dropped. It is a use-case, not a craft: a brass lamp, a
 *    terracotta planter and a block-printed cushion are all home decor, so it
 *    cuts across four of the rows below and has no material family. Every
 *    other category answers "what is it made of"; this one answers "where does
 *    it go", and there is no dye tone for that.
 *
 * 3. The DB is left untouched. Deduplicating it is the teammate's call on a
 *    shared backend, and this file is not the place to make it.
 *
 * Ids stay `c1`-`c6` where a real name is a WIDENING of the craft that id
 * already held (c2 was Blue Pottery, now Pottery; c4 was Brassware and Dhokra,
 * now Metal Art), which is what lets the existing products, artisans and photo
 * pools carry over untouched. `c5` is retired: it held Block Printing, which is
 * textile work and has been absorbed into c1 along with its fixtures and its
 * frames. New crafts take fresh ids from c7.
 *
 * One dye tone per craft, grouped by material family (PRD 9.3). c7-c10 have no
 * products yet; fixtures land one craft at a time, each with its own
 * eye-verified photo pool. A category with no products is harmless - `gallery()`
 * is keyed on a product's categoryId, so an empty craft never reaches it.
 */
export const categories: Category[] = [
  // Textile and dyed.
  { id: 'c1', name: 'Handloom', slug: 'handloom', dye: 'indigo', icon: '🧵' },

  // Painted and worked surfaces. Leather sits here rather than with plant
  // fibre: it is a tanned and dyed hide, closer to the worked-surface family
  // than to anything woven or grown.
  { id: 'c3', name: 'Paintings', slug: 'paintings', dye: 'madder', icon: '🎨' },
  { id: 'c9', name: 'Leather', slug: 'leather', dye: 'madder', icon: '👜' },

  // Metal and fired. Pottery is fired earthenware, so it groups here on
  // material even though c2 was indigo when it was specifically *Blue*
  // Pottery - that tone was a literal reading of the cobalt, and the widened
  // name no longer justifies it.
  { id: 'c2', name: 'Pottery', slug: 'pottery', dye: 'brass', icon: '🏺' },
  { id: 'c4', name: 'Metal Art', slug: 'metal-art', dye: 'brass', icon: '⚒️' },
  { id: 'c8', name: 'Jewellery', slug: 'jewellery', dye: 'brass', icon: '💍' },
  { id: 'c10', name: 'Stone Art', slug: 'stone-art', dye: 'brass', icon: '🪨' },

  // Plant fibre and natural.
  { id: 'c6', name: 'Bamboo', slug: 'bamboo', dye: 'marigold', icon: '🎍' },
  { id: 'c7', name: 'Wood Craft', slug: 'wood-craft', dye: 'marigold', icon: '🪵' },
]
