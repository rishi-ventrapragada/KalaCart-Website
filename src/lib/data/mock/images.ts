/**
 * Deterministic placeholder imagery: a given product shows the same gallery on
 * every load, without checking any assets into the repo. Replaced by real
 * Supabase Storage URLs when the backend is wired (PRD section 16, question 4).
 *
 * The photographs are real craft photography from Pexels, drawn per category so
 * a Blue Pottery listing only ever shows pottery. The seeded-random source it
 * replaced returned any photograph at all, which put a waterfall on a cotton
 * stole and a city skyline on a Bhujodi throw. A reviewer reads that as the
 * catalogue being fake rather than as the fixture being a placeholder, and the
 * artisan storytelling the whole site is built on stops carrying.
 *
 * Every frame was confirmed by eye to be the Indian craft it sits under, not
 * accepted on its search keyword. Stock tagging is unreliable on exactly the
 * axis that matters here: "Jaipur blue pottery" returns Jaipur architecture and
 * brown terracotta, "madhubani" returns mask painting in Dhaka, and "dhokra"
 * returns West African bronze. Any of those would read to a judge from the
 * Ministry as the platform not knowing its own crafts.
 *
 * Pexels licence: free for commercial use, no attribution required, and no
 * restriction that touches this use. Hotlinked rather than vendored so the repo
 * stays free of binary assets, which is also why `RemoteImage` owning the
 * fallback matters here.
 *
 * Note the two fallbacks are different things and only one survives. A frame
 * that fails to LOAD is `RemoteImage`'s business and stays soft - a dead URL
 * must not collapse a card. A frame that was never DEFINED is a fixture gap, and
 * this module now throws on it rather than borrowing another craft's pool: see
 * `unknownId` below.
 */

/** Six to a craft, so a five-image gallery never repeats a frame. */
const byCategory = {
  // Handloom Textiles — Indian weavers at pit and frame looms, and a dye yard.
  c1: [38556299, 32673642, 14953193, 31508152, 34395785, 4253609],
  // Blue Pottery — Jaipur cobalt-on-white work. Short by design: see the note
  // above `gallery`. Everything else the search offered was terracotta,
  // Turkish, or unplaceable, and a wrong frame costs more than a repeated one.
  c2: [33575396, 33575397, 34022881],
  // Madhubani Painting — Mithila panels and Indian folk-art stalls.
  c3: [34961656, 165891, 22820070, 10653309, 36817155, 22820072],
  // Brassware and Dhokra — Dhokra vessels, Indian brass deities, a bronze caster.
  c4: [39032263, 34504204, 12573352, 33311200, 26792961, 33311188],
  // Block Printing — Jaipur printers, block carvers, Ajrakh drying in Ajrakhpur.
  c5: [7037689, 57565, 4566670, 28389703, 15020640, 39180709],
  // Bamboo and Cane — Indian basket makers and their stock.
  c6: [18358177, 12940501, 34878662, 14224817, 35264910, 14367748],
} as const satisfies Record<string, readonly number[]>

/**
 * Both lookups below THROW on an unknown id rather than substituting a frame.
 *
 * They used to fall back to a known-good photo and to `byCategory.c1`, which
 * meant any category outside c1-c6 silently showed handloom textiles: looms and
 * dye yards under, say, Pattachitra. That is precisely the failure this file was
 * built to prevent - the header's "waterfall on a cotton stole", reintroduced
 * through the back door and harder to spot, because a plausible Indian craft
 * photograph under the wrong craft does not look broken to anyone who does not
 * already know the taxonomy.
 *
 * Unreachable while the fixtures cover exactly c1-c6, which is the point: the
 * cost of a silent fallback is paid later, when the taxonomy grows and the new
 * craft quietly wears the old one's photographs. Both call sites run at module
 * scope (`products.ts` maps over its seeds, `artisans.ts` calls per literal), so
 * a throw surfaces as an import-time failure with the offending id named - not
 * as a crash mid-render.
 */
const unknownId = (kind: string, id: string, known: readonly string[]): never => {
  throw new Error(
    `images.ts: no ${kind} fixture for '${id}'. Known: ${known.join(', ')}. ` +
      `Add real photography for it rather than letting it borrow another craft's.`,
  )
}

/** One portrait per artisan, matched to the craft they practise. */
const portraits: Record<string, number> = {
  a1: 14953193, a2: 33575396, a3: 22820070,
  a4: 26792961, a5: 7037689, a6: 34878662,
  a7: 32673642, a8: 22820072, a9: 12940501,
}

const url = (id: number, size: number): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg` +
  `?auto=compress&cs=tinysrgb&w=${size}&h=${size}&fit=crop`

/**
 * A stable index into a craft's pool. Products are numbered p1, p2, p3... in
 * source order, so hashing the whole id rather than a trailing number keeps
 * neighbouring listings from marching through the pool in lockstep and showing
 * the grid the same photograph down a column.
 */
const hash = (seed: string): number => {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Artisan portrait, by artisan id. Throws on an unknown id: see `unknownId`. */
export const artisanPhoto = (artisanId: string): string => {
  const photo = portraits[artisanId] ?? unknownId('artisan', artisanId, Object.keys(portraits))
  return url(photo, 400)
}

/**
 * PRD section 8 requires 3 to 5 gallery images per product. Each is a distinct
 * frame from the product's own craft: offsetting by the seed hash and stepping
 * through the pool keeps neighbouring listings from opening on the same photo.
 *
 * A gallery is capped at the size of its craft's pool, so it never shows the
 * same frame twice. Blue Pottery has only three verified Jaipur images, so its
 * five-image listings show three. That is the deliberate trade: a short gallery
 * reads as a small catalogue, while a padded one reads as a fake catalogue, and
 * a repeated frame in a five-thumbnail strip is the more obvious tell of the
 * two. Widening the pool is a matter of finding three more correct photographs.
 */
export const gallery = (seed: string, count: number, categoryId: string): string[] => {
  const pool: readonly number[] =
    categoryId in byCategory
      ? byCategory[categoryId as keyof typeof byCategory]
      : unknownId('category', categoryId, Object.keys(byCategory))
  const start = hash(seed) % pool.length
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => {
    // In bounds by construction (the index is taken modulo the pool length);
    // `noUncheckedIndexedAccess` still types it as possibly undefined. `??`
    // onto a `never`-returning throw narrows without a cast, and keeps the
    // no-substitution rule whole rather than reaching for a stand-in frame.
    const photo =
      pool[(start + i) % pool.length] ??
      unknownId('category', categoryId, Object.keys(byCategory))
    return url(photo, 800)
  })
}
