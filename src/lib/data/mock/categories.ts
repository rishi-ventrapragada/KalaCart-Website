import type { Category } from '@/lib/data/types'

/** One dye tone per craft, the only place a multi-colour palette appears (PRD 9.3). */
export const categories: Category[] = [
  { id: 'c1', name: 'Handloom Textiles', slug: 'handloom-textiles', dye: 'indigo' },
  { id: 'c2', name: 'Blue Pottery', slug: 'blue-pottery', dye: 'indigo' },
  { id: 'c3', name: 'Madhubani Painting', slug: 'madhubani-painting', dye: 'madder' },
  { id: 'c4', name: 'Brassware and Dhokra', slug: 'brassware-dhokra', dye: 'brass' },
  { id: 'c5', name: 'Block Printing', slug: 'block-printing', dye: 'marigold' },
  { id: 'c6', name: 'Bamboo and Cane', slug: 'bamboo-cane', dye: 'marigold' },
]
