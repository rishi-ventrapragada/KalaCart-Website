import { artisans as seedArtisans } from '@/lib/data/mock/artisans'
import { categories as seedCategories } from '@/lib/data/mock/categories'
import { inquiries as seedInquiries } from '@/lib/data/mock/inquiries'
import { products as seedProducts } from '@/lib/data/mock/products'
import { summarize } from '@/lib/data/summarize'
import type {
  AnalyticsSummary,
  Artisan,
  ArtisanFilters,
  Category,
  DataProvider,
  NewInquiry,
  Product,
  ProductFilters,
  Status,
} from '@/lib/data/types'

/**
 * In-memory store. Mutations (setArtisanStatus, createInquiry) write here, so
 * approving from the queue really does remove the row and move the analytics
 * numbers within a session. State resets on reload, which is correct for a mock.
 */
const store = {
  categories: [...seedCategories],
  artisans: [...seedArtisans],
  products: [...seedProducts],
  inquiries: [...seedInquiries],
}

/** Simulated network latency, so loading states are genuinely exercised. */
const latency = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 180 + Math.random() * 340))

const matches = (haystack: string, needle: string): boolean =>
  haystack.toLowerCase().includes(needle.toLowerCase().trim())

/**
 * Buyer-facing reads return approved rows only (PRD sections 11.2 and 11.5).
 * The admin queue reaches pending rows through its own functions.
 */
async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  await latency()

  const regionByArtisan = new Map(store.artisans.map((a) => [a.id, a.region]))
  let result = store.products.filter((p) => p.status === 'approved')

  if (filters?.query) {
    const q = filters.query
    result = result.filter((p) => matches(p.title, q) || matches(p.description, q))
  }
  if (filters?.categoryId) {
    result = result.filter((p) => p.categoryId === filters.categoryId)
  }
  if (filters?.artisanId) {
    result = result.filter((p) => p.artisanId === filters.artisanId)
  }
  if (filters?.region) {
    result = result.filter((p) => (regionByArtisan.get(p.artisanId) ?? '') === filters.region)
  }
  if (filters?.minPrice !== undefined) {
    const min = filters.minPrice
    result = result.filter((p) => p.priceInr >= min)
  }
  if (filters?.maxPrice !== undefined) {
    const max = filters.maxPrice
    result = result.filter((p) => p.priceInr <= max)
  }

  const sorted = [...result]
  switch (filters?.sort ?? 'newest') {
    case 'price-asc':
      sorted.sort((a, b) => a.priceInr - b.priceInr)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.priceInr - a.priceInr)
      break
    case 'newest':
      sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      break
  }

  return sorted.map((p) => ({ ...p, imageUrls: [...p.imageUrls] }))
}

async function getProductById(id: string): Promise<Product | null> {
  await latency()
  const found = store.products.find((p) => p.id === id)
  return found ? { ...found, imageUrls: [...found.imageUrls] } : null
}

async function getArtisanById(id: string): Promise<Artisan | null> {
  await latency()
  const found = store.artisans.find((a) => a.id === id)
  if (!found) return null
  return withProductCount(found)
}

async function getCategories(): Promise<Category[]> {
  await latency()
  return store.categories.map((c) => ({ ...c }))
}

async function getPendingArtisans(): Promise<Artisan[]> {
  await latency()
  return store.artisans.filter((a) => a.status === 'pending').map(withProductCount)
}

async function setArtisanStatus(id: string, status: Status): Promise<void> {
  await latency()
  const artisan = store.artisans.find((a) => a.id === id)
  if (!artisan) throw new Error(`No artisan with id ${id}`)
  artisan.status = status
}

/** The product half of the queue (PRD 11.6). Mirrors getPendingArtisans. */
async function getPendingProducts(): Promise<Product[]> {
  await latency()
  return store.products
    .filter((p) => p.status === 'pending')
    .map((p) => ({ ...p, imageUrls: [...p.imageUrls] }))
}

async function setProductStatus(id: string, status: Status): Promise<void> {
  await latency()
  const product = store.products.find((p) => p.id === id)
  if (!product) throw new Error(`No product with id ${id}`)
  product.status = status
}

async function getAllArtisans(filters?: ArtisanFilters): Promise<Artisan[]> {
  await latency()
  let result = [...store.artisans]

  if (filters?.query) {
    const q = filters.query
    result = result.filter((a) => matches(a.name, q) || matches(a.region, q))
  }
  if (filters?.categoryId) {
    result = result.filter((a) => a.categoryId === filters.categoryId)
  }
  if (filters?.region) {
    result = result.filter((a) => a.region === filters.region)
  }
  if (filters?.status) {
    result = result.filter((a) => a.status === filters.status)
  }

  return result.map(withProductCount)
}

async function createInquiry(input: NewInquiry): Promise<void> {
  await latency()
  store.inquiries.push({
    ...input,
    id: `i${store.inquiries.length + 1}`,
    createdAt: new Date().toISOString(),
  })
}

async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await latency()
  return summarize(store)
}

/** Copied on the way out, so callers cannot mutate the store by reference. */
function withProductCount(artisan: Artisan): Artisan {
  return {
    ...artisan,
    productCount: store.products.filter(
      (p) => p.artisanId === artisan.id && p.status === 'approved',
    ).length,
  }
}

export const mockProvider = {
  getProducts,
  getProductById,
  getArtisanById,
  getCategories,
  getPendingArtisans,
  setArtisanStatus,
  getPendingProducts,
  setProductStatus,
  getAllArtisans,
  createInquiry,
  getAnalyticsSummary,
} satisfies DataProvider
