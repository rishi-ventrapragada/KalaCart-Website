import type { Artisan } from '@/lib/data/types'
import { artisanPhoto } from '@/lib/data/mock/images'

/**
 * Ten artisans across six of the taxonomy's crafts, with real craft-region
 * pairings. Three crafts (Jewellery, Leather, Stone Art) have no
 * artisan yet and gain one when their fixtures land. The status
 * mix is deliberate: six approved so buyer surfaces have content, three
 * pending so the admin queue has real work, one rejected so the queue's
 * outcomes are visible in analytics.
 *
 * Profiles are intentionally minimal per PRD section 8 - name, craft, region,
 * no long bio.
 */

export const artisans: Artisan[] = [
  {
    id: 'a1',
    name: 'Hansaben Vankar',
    categoryId: 'c1',
    region: 'Kutch, Gujarat',
    photoUrl: artisanPhoto('a1'),
    phone: '+919876543201',
    status: 'approved',
    createdAt: '2024-08-14T09:20:00.000Z',
  },
  {
    id: 'a2',
    name: 'Ram Prasad Sharma',
    categoryId: 'c2',
    region: 'Jaipur, Rajasthan',
    photoUrl: artisanPhoto('a2'),
    phone: '+919876543202',
    status: 'approved',
    createdAt: '2024-09-02T11:45:00.000Z',
  },
  {
    id: 'a3',
    name: 'Sunita Devi',
    categoryId: 'c3',
    region: 'Madhubani, Bihar',
    photoUrl: artisanPhoto('a3'),
    phone: '+919876543203',
    status: 'approved',
    createdAt: '2024-10-19T15:05:00.000Z',
  },
  {
    id: 'a4',
    name: 'Budhram Baghel',
    categoryId: 'c4',
    region: 'Bastar, Chhattisgarh',
    photoUrl: artisanPhoto('a4'),
    phone: '+919876543204',
    status: 'approved',
    createdAt: '2024-11-27T08:30:00.000Z',
  },
  {
    id: 'a5',
    name: 'Mohammed Yusuf Chhipa',
    // Block printing is textile work; c5 was retired into c1 with the taxonomy.
    categoryId: 'c1',
    region: 'Bagru, Rajasthan',
    photoUrl: artisanPhoto('a5'),
    phone: '+919876543205',
    status: 'approved',
    createdAt: '2025-01-16T13:10:00.000Z',
  },
  {
    id: 'a6',
    name: 'Lakshmi Ammal',
    categoryId: 'c1',
    region: 'Kancheepuram, Tamil Nadu',
    photoUrl: artisanPhoto('a6'),
    phone: '+919876543206',
    status: 'pending',
    createdAt: '2025-04-08T10:00:00.000Z',
  },
  {
    id: 'a7',
    name: 'Bhaskar Chitrakar',
    categoryId: 'c3',
    region: 'Bishnupur, West Bengal',
    photoUrl: artisanPhoto('a7'),
    phone: '+919876543207',
    status: 'pending',
    createdAt: '2025-05-21T16:40:00.000Z',
  },
  {
    id: 'a8',
    name: 'Nayan Hazarika',
    categoryId: 'c6',
    region: 'Majuli, Assam',
    photoUrl: artisanPhoto('a8'),
    phone: '+919876543208',
    status: 'pending',
    createdAt: '2025-06-30T12:15:00.000Z',
  },
  {
    id: 'a9',
    name: 'Syed Ghani Khan',
    // Moved c4 → c7: Channapatna is a lacquered-wood town, so filing this
    // maker under Metal Art was factually wrong. It predates the taxonomy,
    // which had no wood craft to put him under. Status and createdAt are
    // untouched, so the admin status mix and the analytics chart are as before.
    categoryId: 'c7',
    region: 'Channapatna, Karnataka',
    photoUrl: artisanPhoto('a9'),
    phone: '+919876543209',
    status: 'rejected',
    createdAt: '2025-02-11T09:55:00.000Z',
  },
  {
    id: 'a10',
    name: 'Mohammad Aslam Ansari',
    categoryId: 'c7',
    region: 'Saharanpur, Uttar Pradesh',
    photoUrl: artisanPhoto('a10'),
    phone: '+919876543210',
    status: 'approved',
    createdAt: '2025-03-05T14:25:00.000Z',
  },
]
