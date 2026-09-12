import type { Artisan, Dye, Product, Status } from '@/lib/data/types'

/**
 * Row shapes and row-to-domain adapters for `supabaseProvider`.
 *
 * Split out of the provider to keep both files inside the ~200-line limit
 * (memory/decisions.md, 2026-09-07). The provider owns the queries; this file
 * owns the translation, which is where every name mismatch between the live
 * schema and `types.ts` is resolved: full_name→name, price→priceInr,
 * image_urls→imageUrls, city+state→region, seller_id→artisanId.
 */

export const ARTISAN_SELECT =
  'id, artisan_type, status, created_at, profiles!inner(full_name, city, state, phone, avatar_url, profile_photo)'

export const PRODUCT_SELECT =
  'id, seller_id, title, description, price, image_urls, category_id, status, created_at'

/** The shape PostgREST returns for ARTISAN_SELECT. */
export interface SellerRow {
  id: string
  artisan_type: string | null
  status: string | null
  created_at: string | null
  profiles: {
    full_name: string | null
    city: string | null
    state: string | null
    phone: string | null
    avatar_url: string | null
    profile_photo: string | null
  } | null
}

export interface ProductRow {
  id: string
  seller_id: string | null
  title: string | null
  description: string | null
  price: number | null
  image_urls: string[] | null
  category_id: string | null
  status: string | null
  created_at: string | null
}

/**
 * `status` is `text` with a CHECK in both tables, so the database already
 * guarantees one of three values — but the column is typed `string` on the way
 * out and a widened CHECK would arrive here silently. Narrow it explicitly.
 */
const toStatus = (value: string | null): Status =>
  value === 'approved' || value === 'rejected' ? value : 'pending'

/**
 * `region` is composed, because no single column holds it: the place text lives
 * on the profile as city and state. Empty parts are dropped rather than
 * rendered as ", Karnataka" or a bare comma.
 */
const toRegion = (city: string | null, state: string | null): string =>
  [city, state].map((part) => part?.trim()).filter(Boolean).join(', ')

/**
 * `Artisan.categoryId` has no real source.
 *
 * `sellers.artisan_type` is free text the mobile app writes from its own craft
 * list — the one live row reads "Handloom & Textiles", which matches no
 * `categories.name`. There is no FK from sellers to categories at all. Rather
 * than resolve it against the category table and hand back an id that is right
 * only by coincidence, the raw text is passed through: the queue renders this
 * as the artisan's craft, and a wrong-but-plausible uuid would be worse than an
 * honest label. Correcting this means a real `sellers.category_id` column.
 */
export const toArtisan = (row: SellerRow, productCount: number): Artisan => ({
  id: row.id,
  name: row.profiles?.full_name?.trim() || 'Unnamed artisan',
  categoryId: row.artisan_type ?? '',
  region: toRegion(row.profiles?.city ?? null, row.profiles?.state ?? null),
  photoUrl: row.profiles?.avatar_url || row.profiles?.profile_photo || '',
  phone: row.profiles?.phone ?? '',
  status: toStatus(row.status),
  createdAt: row.created_at ?? '',
  productCount,
})

export const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  artisanId: row.seller_id ?? '',
  title: row.title ?? '',
  description: row.description ?? '',
  priceInr: row.price ?? 0,
  imageUrls: row.image_urls ?? [],
  categoryId: row.category_id ?? '',
  status: toStatus(row.status),
  createdAt: row.created_at ?? '',
})

/**
 * `slug` and `dye` are frontend concepts with no column behind them.
 *
 * The live table carries only id, name, icon, image_url and created_at, so the
 * slug is derived and the dye is assigned by material family, matching the
 * groupings in `mock/categories.ts`. An unrecognised name falls back to brass
 * rather than throwing — a new craft added to the shared table by the mobile
 * team should render, not break the page.
 */
export const slugify = (name: string): string =>
  name.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const DYE_BY_NAME: Record<string, Dye> = {
  Handloom: 'indigo',
  Textiles: 'indigo',
  Leather: 'indigo',
  Paintings: 'madder',
  'Stone Art': 'madder',
  Pottery: 'brass',
  'Metal Art': 'brass',
  Jewellery: 'brass',
  'Home Decor': 'brass',
  Bamboo: 'marigold',
  'Bamboo Craft': 'marigold',
  'Wood Craft': 'marigold',
}
