/**
 * The shared data model (PRD section 8).
 *
 * These field names and the `Status` enum are the contract with the teammate's
 * Supabase schema. Do not rename anything here without coordinating first
 * (PRD section 16, open question 1).
 */

export type Status = 'pending' | 'approved' | 'rejected'

/**
 * Category colour-coding, one dye tone per craft (PRD section 9.3).
 *
 * Deliberately NARROWER than `dyes` / `DyeName` in `src/app/theme.ts`, which
 * carries a fifth tone (`sage`) that is a palette colour with no category. This
 * is the data contract, so it lists only tones a category may actually hold;
 * see the note beside `sage` before widening it.
 *
 * Many-to-one by design: six categories currently share four tones.
 */
export type Dye = 'indigo' | 'madder' | 'marigold' | 'brass'

export interface Category {
  id: string
  name: string
  slug: string
  dye: Dye
}

/**
 * Intentionally minimal: name, craft, region. No long bio — the artisan's
 * story lives in the mobile app, not here.
 */
export interface Artisan {
  id: string
  name: string
  categoryId: string
  region: string
  photoUrl: string
  phone: string
  status: Status
  createdAt: string
  productCount?: number
}

export interface Product {
  id: string
  artisanId: string
  title: string
  description: string
  priceInr: number
  /** Gallery: the first image is the cover, the rest fill the gallery. */
  imageUrls: string[]
  categoryId: string
  status: Status
  createdAt: string
}

export interface Inquiry {
  id: string
  productId: string
  buyerName: string
  buyerContact: string
  message: string
  createdAt: string
}

export type NewInquiry = Omit<Inquiry, 'id' | 'createdAt'>

export type ProductSort = 'newest' | 'price-asc' | 'price-desc'

export interface ProductFilters {
  query?: string
  categoryId?: string
  /**
   * One artisan's catalog (PRD 11.5). A query shape rather than a new column,
   * so it costs the Supabase schema nothing: it is an `eq` on a foreign key
   * the table already has. Status filtering stays inside the provider, so a
   * caller cannot ask for one artisan's pending work by accident.
   */
  artisanId?: string
  region?: string
  minPrice?: number
  maxPrice?: number
  sort?: ProductSort
}

/**
 * Not in PRD section 8, but section 5.2 passes filters to `getAllArtisans` and
 * section 11.7 specifies the admin table filters as status, category and region.
 */
export interface ArtisanFilters {
  query?: string
  categoryId?: string
  region?: string
  status?: Status
}

export interface AnalyticsSummary {
  totalArtisans: number
  approvedArtisans: number
  pendingArtisans: number
  totalProducts: number
  totalInquiries: number
  artisansByCategory: { category: string; count: number }[]
  signupsOverTime: { month: string; count: number }[]
}

/**
 * The seam itself (PRD section 5.2). Both providers are declared
 * `satisfies DataProvider`, which is what mechanically keeps their signatures
 * identical — so swapping the active provider in `index.ts` is a one-line change.
 */
export interface DataProvider {
  getProducts(filters?: ProductFilters): Promise<Product[]>
  getProductById(id: string): Promise<Product | null>
  getArtisanById(id: string): Promise<Artisan | null>
  getCategories(): Promise<Category[]>
  getPendingArtisans(): Promise<Artisan[]>
  setArtisanStatus(id: string, status: Status): Promise<void>
  /**
   * The product half of the verification queue (PRD 11.6).
   *
   * Added in Increment 13. PRD 5.2 lists only the artisan pair, but 11.6
   * specifies tabs for BOTH artisans and products, and the mock fixtures
   * already carry pending products - the page spec and the function list
   * disagreed, and the page spec is the one describing what a reviewer does.
   * These mirror the artisan pair exactly so the Supabase implementation is
   * the same query against the other table.
   */
  getPendingProducts(): Promise<Product[]>
  setProductStatus(id: string, status: Status): Promise<void>
  getAllArtisans(filters?: ArtisanFilters): Promise<Artisan[]>
  createInquiry(input: NewInquiry): Promise<void>
  getAnalyticsSummary(): Promise<AnalyticsSummary>
}
