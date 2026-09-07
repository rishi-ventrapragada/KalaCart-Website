import type { DataProvider } from '@/lib/data/types'

/**
 * STUB. Same signatures as the mock provider, wired to nothing.
 *
 * When the backend is ready this file gets real Supabase calls and `index.ts`
 * switches one line to point here. The `satisfies DataProvider` below is what
 * guarantees the swap compiles: if a signature drifts from the mock provider,
 * this stops building.
 */

const notWired = (): never => {
  throw new Error('Supabase provider not wired yet')
}

export const supabaseProvider = {
  getProducts: notWired,
  getProductById: notWired,
  getArtisanById: notWired,
  getCategories: notWired,
  getPendingArtisans: notWired,
  setArtisanStatus: notWired,
  getAllArtisans: notWired,
  createInquiry: notWired,
  getAnalyticsSummary: notWired,
} satisfies DataProvider
