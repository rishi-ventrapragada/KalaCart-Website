import { supabase } from '@/lib/data/supabaseClient'
import { expectRows, raise } from '@/lib/data/supabaseErrors'
import {
  ARTISAN_SELECT,
  DYE_BY_NAME,
  PRODUCT_SELECT,
  slugify,
  toArtisan,
  toProduct,
  type ProductRow,
  type SellerRow,
} from '@/lib/data/supabaseAdapters'
import type { Artisan, Category, DataProvider, Product, Status } from '@/lib/data/types'

/**
 * The real backend, implemented only as far as the verification queue needs.
 *
 * Six of the eleven `DataProvider` methods are live: the two queue reads, the
 * two status writes, and the two lookups the queue rows need to name a category
 * and a seller. The rest still throw, and `index.ts` still points at
 * `mockProvider`, so the public site serves mock data. That split is deliberate
 * and temporary — `products` currently holds zero rows, and flipping the seam
 * today would empty Home, Browse and every product page. See memory/decisions.md,
 * 2026-09-12, "The Admin Queue Calls Supabase Directly".
 *
 * WHAT THESE WRITES RIDE ON: RLS is wide open on the tables below. The queue
 * sends the publishable key and no user JWT, so `auth.uid()` is null for every
 * request it makes. It works because the permissive `*_all` policies are still
 * in place, not because anything here is authorised. `supabaseErrors.ts` exists
 * so the day that changes is diagnosable in seconds rather than in an
 * afternoon — read its header before debugging an empty queue.
 */

/**
 * Every category row, as the table holds them.
 *
 * NOTE this is NOT what `mockProvider` serves. The mock deliberately collapses
 * "Bamboo Craft" into "Bamboo" and "Textiles" into "Handloom" (duplicates from
 * a second seed run) and drops "Home Decor" as a use-case rather than a craft —
 * see the header of `mock/categories.ts`. Those twelve rows come back here
 * unfiltered, because this function's job is to label queue rows by their real
 * `category_id`, and hiding a row would leave a product's category blank.
 * Deduplicating the shared table is the teammate's call, not this file's.
 */
async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon')
    .order('created_at', { ascending: true })
  if (error) raise('Loading categories', error)

  return (data ?? []).map((row) => {
    const typed = row as { id: string; name: string | null; icon: string | null }
    const name = typed.name ?? ''
    return {
      id: typed.id,
      name,
      slug: slugify(name),
      dye: DYE_BY_NAME[name] ?? 'brass',
      icon: typed.icon ?? '',
    }
  })
}

/**
 * Every artisan regardless of status, so the product queue can name the seller
 * behind a pending listing. The queue looks these up by id and tolerates a
 * miss, so this deliberately does not filter.
 */
async function getAllArtisans(): Promise<Artisan[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select(ARTISAN_SELECT)
    .order('created_at', { ascending: true })
  if (error) raise('Loading artisans', error)

  const rows = (data ?? []) as unknown as SellerRow[]
  const counts = await countProductsBySeller(rows.map((row) => row.id))
  return rows.map((row) => toArtisan(row, counts.get(row.id) ?? 0))
}

/** Products per seller, for the count the artisan rows carry. */
async function countProductsBySeller(sellerIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (sellerIds.length === 0) return counts

  const { data, error } = await supabase
    .from('products')
    .select('seller_id')
    .in('seller_id', sellerIds)
  if (error) raise('Counting products per artisan', error)

  for (const row of data ?? []) {
    const id = (row as { seller_id: string | null }).seller_id
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

async function getPendingArtisans(): Promise<Artisan[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select(ARTISAN_SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) raise('Loading pending artisans', error)

  // `!inner` on profiles means a seller with no profile row is excluded rather
  // than rendered as "Unnamed artisan" with no region or phone — the reviewer
  // cannot act on a row with nothing to identify it by.
  const rows = (data ?? []) as unknown as SellerRow[]
  const counts = await countProductsBySeller(rows.map((row) => row.id))
  return rows.map((row) => toArtisan(row, counts.get(row.id) ?? 0))
}

async function getPendingProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) raise('Loading pending products', error)
  return ((data ?? []) as unknown as ProductRow[]).map(toProduct)
}

async function setArtisanStatus(id: string, status: Status): Promise<void> {
  const { data, error } = await supabase
    .from('sellers')
    .update({ status })
    .eq('id', id)
    .select('id')
  if (error) raise(`Setting artisan ${id} to ${status}`, error)
  expectRows(`Setting artisan ${id} to ${status}`, data, id)
}

/**
 * Writes `status` only, never `is_active`.
 *
 * A trigger on `products` derives `is_active` from `status` on every update
 * (`approved` → true, anything else → false), so sending both means competing
 * with it for the same field. Approving here therefore also makes the row
 * visible to the mobile app, whose buyer catalogue filters on
 * `status = 'approved' AND is_active = true`.
 */
async function setProductStatus(id: string, status: Status): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', id)
    .select('id')
  if (error) raise(`Setting product ${id} to ${status}`, error)
  expectRows(`Setting product ${id} to ${status}`, data, id)
}

/**
 * Still the stub, for everything the public site reads. `index.ts` points at
 * `mockProvider`, so none of these is reachable today; they throw rather than
 * return empty so that pointing the seam here by mistake fails loudly instead
 * of silently rendering an empty catalogue.
 */
const notWired = (): never => {
  throw new Error(
    'This DataProvider method is not implemented against Supabase yet. Only the ' +
      'verification queue is wired — see memory/decisions.md, 2026-09-12.',
  )
}

export const supabaseProvider = {
  getProducts: notWired,
  getProductById: notWired,
  getArtisanById: notWired,
  getCategories,
  getPendingArtisans,
  setArtisanStatus,
  getPendingProducts,
  setProductStatus,
  getAllArtisans,
  createInquiry: notWired,
  getAnalyticsSummary: notWired,
} satisfies DataProvider
