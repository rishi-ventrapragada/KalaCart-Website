import { mockProvider } from '@/lib/data/mockProvider'
import type { DataProvider } from '@/lib/data/types'

/**
 * THE SWAP POINT (PRD section 5.2).
 *
 * Components import from here and never from a provider directly, so moving to
 * the real backend is this one line:
 *
 *   const provider: DataProvider = supabaseProvider
 */
const provider: DataProvider = mockProvider

/**
 * Forwarded rather than destructured, so a future provider is free to be a
 * class or to rely on `this` without these bindings silently breaking.
 */
export const getProducts: DataProvider['getProducts'] = (filters) =>
  provider.getProducts(filters)

export const getProductById: DataProvider['getProductById'] = (id) =>
  provider.getProductById(id)

export const getArtisanById: DataProvider['getArtisanById'] = (id) =>
  provider.getArtisanById(id)

export const getCategories: DataProvider['getCategories'] = () => provider.getCategories()

export const getPendingArtisans: DataProvider['getPendingArtisans'] = () =>
  provider.getPendingArtisans()

export const setArtisanStatus: DataProvider['setArtisanStatus'] = (id, status) =>
  provider.setArtisanStatus(id, status)

export const getPendingProducts: DataProvider['getPendingProducts'] = () =>
  provider.getPendingProducts()

export const setProductStatus: DataProvider['setProductStatus'] = (id, status) =>
  provider.setProductStatus(id, status)

export const getAllArtisans: DataProvider['getAllArtisans'] = (filters) =>
  provider.getAllArtisans(filters)

export const createInquiry: DataProvider['createInquiry'] = (input) =>
  provider.createInquiry(input)

export const getAnalyticsSummary: DataProvider['getAnalyticsSummary'] = () =>
  provider.getAnalyticsSummary()

export type * from '@/lib/data/types'
