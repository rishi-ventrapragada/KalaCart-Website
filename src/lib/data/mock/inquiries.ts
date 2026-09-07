import type { Inquiry } from '@/lib/data/types'

/** Seeded so the analytics inquiry count is not zero before anyone submits one. */
export const inquiries: Inquiry[] = [
  {
    id: 'i1',
    productId: 'p1',
    buyerName: 'Ananya Rao',
    buyerContact: 'ananya.rao@example.com',
    message: 'Is this available in a larger size?',
    createdAt: '2025-06-14T09:12:00.000Z',
  },
  {
    id: 'i2',
    productId: 'p9',
    buyerName: 'Vikram Sethi',
    buyerContact: '+919812345670',
    message: 'Could you share the framed dimensions?',
    createdAt: '2025-07-02T14:30:00.000Z',
  },
  {
    id: 'i3',
    productId: 'p13',
    buyerName: 'Meera Joshi',
    buyerContact: 'meera.j@example.com',
    message: 'Do you take bulk orders for a store?',
    createdAt: '2025-07-21T11:05:00.000Z',
  },
  {
    id: 'i4',
    productId: 'p17',
    buyerName: 'Daniel Fischer',
    buyerContact: 'd.fischer@example.com',
    message: 'What is the shipping time to Berlin?',
    createdAt: '2025-08-09T16:48:00.000Z',
  },
  {
    id: 'i5',
    productId: 'p5',
    buyerName: 'Rhea Kapoor',
    buyerContact: '+919845001122',
    message: 'Are these microwave safe?',
    createdAt: '2025-08-18T08:25:00.000Z',
  },
]
