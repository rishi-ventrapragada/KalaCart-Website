import type { Product } from '@/lib/data/types'
import { gallery } from '@/lib/data/mock/images'

/**
 * Thirty products. Prices run from 450 to 18,000 rupees and createdAt spans
 * about a year, so the Browse price filter and the 'newest' sort both have
 * real range to work with, and the signups-over-time chart is not flat.
 *
 * Several belong to pending artisans (a6, a7, a8) and are themselves pending,
 * which is what fills the Products tab of the admin queue. If the teammate's
 * schema turns out to forbid that (PRD section 16, question 3), it is a data
 * edit here, not a refactor.
 */

interface ProductSeed extends Omit<Product, 'imageUrls'> {
  /** How many gallery images to generate, 3 to 5 per PRD section 8. */
  images: number
}

const productSeeds: ProductSeed[] = [
  { id: 'p1', artisanId: 'a1', categoryId: 'c1', priceInr: 4800, images: 5, status: 'approved', createdAt: '2024-09-01T10:00:00.000Z',
    title: 'Kutchi wool shawl, natural dye',
    description:
      'Handwoven on a pit loom in undyed desi wool, finished with a madder-red border. About three weeks on the loom.' },
  { id: 'p2', artisanId: 'a1', categoryId: 'c1', priceInr: 2200, images: 4, status: 'approved', createdAt: '2024-10-12T10:00:00.000Z',
    title: 'Tangaliya cotton stole',
    description:
      'Dana work in white cotton on an indigo ground, each raised dot tied by hand as the weave progresses.' },
  { id: 'p3', artisanId: 'a1', categoryId: 'c1', priceInr: 6500, images: 4, status: 'approved', createdAt: '2025-01-05T10:00:00.000Z',
    title: 'Bhujodi throw, undyed',
    description:
      'Extra-weft weave in sheep wool and cotton, warm without weight. Sized for a single bed or a couch.' },
  { id: 'p4', artisanId: 'a1', categoryId: 'c1', priceInr: 1650, images: 3, status: 'approved', createdAt: '2025-03-22T10:00:00.000Z',
    title: 'Kala cotton table runner',
    description:
      'Woven from rain-fed Kala cotton grown in Kutch, with a plain weave body and a striped end panel.' },
  { id: 'p5', artisanId: 'a2', categoryId: 'c2', priceInr: 3400, images: 5, status: 'approved', createdAt: '2024-09-18T10:00:00.000Z',
    title: 'Blue pottery dinner plates, set of four',
    description:
      'Quartz-body pottery fired at low temperature, painted freehand in cobalt with a floral centre.' },
  { id: 'p6', artisanId: 'a2', categoryId: 'c2', priceInr: 2750, images: 4, status: 'approved', createdAt: '2024-11-04T10:00:00.000Z',
    title: 'Blue pottery surahi',
    description:
      'The traditional narrow-necked water vessel, glazed in turquoise over the classic Jaipur white body.' },
  { id: 'p7', artisanId: 'a2', categoryId: 'c2', priceInr: 5200, images: 5, status: 'approved', createdAt: '2025-02-08T10:00:00.000Z',
    title: 'Floral tile panel, nine piece',
    description:
      'Nine hand-painted tiles that assemble into a single vine pattern. Suited to a kitchen backsplash.' },
  { id: 'p8', artisanId: 'a2', categoryId: 'c2', priceInr: 450, images: 3, status: 'approved', createdAt: '2025-04-30T10:00:00.000Z',
    title: 'Blue pottery soap dish',
    description:
      'A small drained dish in cobalt on white, glazed to resist water. A first piece for a new collector.' },
  { id: 'p9', artisanId: 'a3', categoryId: 'c3', priceInr: 7800, images: 5, status: 'approved', createdAt: '2024-11-11T10:00:00.000Z',
    title: 'Madhubani fish and lotus, framed',
    description:
      'Painted in natural pigment on handmade paper. The fish and lotus pair reads as a wish for abundance.' },
  { id: 'p10', artisanId: 'a3', categoryId: 'c3', priceInr: 14500, images: 5, status: 'approved', createdAt: '2025-01-24T10:00:00.000Z',
    title: 'Kohbar wedding panel',
    description:
      'The traditional bridal chamber composition, worked in the line-heavy Kachni style over several weeks.' },
  { id: 'p11', artisanId: 'a3', categoryId: 'c3', priceInr: 2400, images: 3, status: 'approved', createdAt: '2025-03-09T10:00:00.000Z',
    title: 'Madhubani peacock, small',
    description:
      'A single peacock in the Bharni fill-colour style on handmade paper, sized for a desk or a narrow wall.' },
  { id: 'p12', artisanId: 'a3', categoryId: 'c3', priceInr: 9600, images: 4, status: 'approved', createdAt: '2025-05-14T10:00:00.000Z',
    title: 'Tree of life scroll',
    description:
      'A tall vertical scroll on cotton cloth, the branching tree filled with birds and small animals.' },
  { id: 'p13', artisanId: 'a4', categoryId: 'c4', priceInr: 8200, images: 5, status: 'approved', createdAt: '2024-12-06T10:00:00.000Z',
    title: 'Dhokra horse and rider',
    description:
      'Lost-wax brass casting from Bastar, the surface left with the wire-coil texture the technique produces.' },
  { id: 'p14', artisanId: 'a4', categoryId: 'c4', priceInr: 3900, images: 4, status: 'approved', createdAt: '2025-02-19T10:00:00.000Z',
    title: 'Dhokra measuring bowl',
    description:
      'A cast brass bowl on three feet, modelled on the grain measures once used in weekly village markets.' },
  { id: 'p15', artisanId: 'a4', categoryId: 'c4', priceInr: 18000, images: 5, status: 'approved', createdAt: '2025-04-02T10:00:00.000Z',
    title: 'Dhokra elephant, large',
    description:
      'Cast in a single pour with the trunk raised. Heavy enough to sit as a floor piece beside a doorway.' },
  { id: 'p16', artisanId: 'a4', categoryId: 'c4', priceInr: 2900, images: 3, status: 'approved', createdAt: '2025-06-11T10:00:00.000Z',
    title: 'Brass oil lamps, pair',
    description:
      'A matched pair of deepam lamps with a broad base, finished by hand rather than machine-buffed.' },
  { id: 'p17', artisanId: 'a5', categoryId: 'c5', priceInr: 5600, images: 5, status: 'approved', createdAt: '2025-02-01T10:00:00.000Z',
    title: 'Bagru dabu print bedcover',
    description:
      'Mud-resist printed with hand-cut teak blocks and dyed in indigo. Double bed size with two pillow covers.' },
  { id: 'p18', artisanId: 'a5', categoryId: 'c5', priceInr: 1200, images: 4, status: 'approved', createdAt: '2025-03-17T10:00:00.000Z',
    title: 'Indigo block print stole',
    description:
      'Fine cotton mul printed in a small buti repeat, soft enough to fold into a bag and carry all day.' },
  { id: 'p19', artisanId: 'a5', categoryId: 'c5', priceInr: 1450, images: 3, status: 'approved', createdAt: '2025-05-08T10:00:00.000Z',
    title: 'Hand block napkins, set of six',
    description:
      'Six cotton napkins in madder red on off-white, printed with a border block along one edge.' },
  { id: 'p20', artisanId: 'a5', categoryId: 'c5', priceInr: 1900, images: 4, status: 'approved', createdAt: '2025-06-25T10:00:00.000Z',
    title: 'Dabu print cotton yardage',
    description:
      'Two and a half metres of dabu-printed cotton, enough for one adult kurta, sold as uncut yardage.' },
  { id: 'p21', artisanId: 'a6', categoryId: 'c1', priceInr: 16500, images: 5, status: 'pending', createdAt: '2025-04-12T10:00:00.000Z',
    title: 'Kancheepuram silk saree, temple border',
    description:
      'Pure mulberry silk with a contrast pallu and a zari temple border, woven on a handloom over forty days.' },
  { id: 'p22', artisanId: 'a6', categoryId: 'c1', priceInr: 6200, images: 4, status: 'pending', createdAt: '2025-05-03T10:00:00.000Z',
    title: 'Silk cotton saree, checked',
    description:
      'A lighter everyday weave blending a silk warp with cotton weft, in a small mustard and black check.' },
  { id: 'p23', artisanId: 'a6', categoryId: 'c1', priceInr: 3100, images: 3, status: 'approved', createdAt: '2025-06-18T10:00:00.000Z',
    title: 'Zari border dupatta',
    description:
      'A silk dupatta with a narrow gold zari border, woven as an offcut piece from the saree warp.' },
  { id: 'p24', artisanId: 'a7', categoryId: 'c3', priceInr: 11200, images: 5, status: 'pending', createdAt: '2025-05-26T10:00:00.000Z',
    title: 'Bengal Patachitra scroll',
    description:
      'A narrative scroll painted in natural colour, unrolled panel by panel as the story is sung aloud.' },
  { id: 'p25', artisanId: 'a7', categoryId: 'c3', priceInr: 6800, images: 4, status: 'pending', createdAt: '2025-07-04T10:00:00.000Z',
    title: 'Patachitra Durga panel',
    description:
      'A single framed panel of the ten-armed Durga, painted on cloth-backed handmade paper.' },
  { id: 'p26', artisanId: 'a8', categoryId: 'c6', priceInr: 1350, images: 4, status: 'pending', createdAt: '2025-07-01T10:00:00.000Z',
    title: 'Bamboo japi, decorative',
    description:
      'The conical Assamese sunhat, woven from split bamboo and dyed cane, made here as a wall piece.' },
  { id: 'p27', artisanId: 'a8', categoryId: 'c6', priceInr: 2600, images: 4, status: 'pending', createdAt: '2025-07-19T10:00:00.000Z',
    title: 'Cane storage basket, tall',
    description:
      'Close-woven cane with a fitted lid, tall enough for folded blankets and light enough to move one-handed.' },
  { id: 'p28', artisanId: 'a8', categoryId: 'c6', priceInr: 980, images: 3, status: 'approved', createdAt: '2025-08-02T10:00:00.000Z',
    title: 'Bamboo serving tray',
    description:
      'A flat woven tray with a rolled cane rim, sealed with a food-safe finish for table use.' },
  { id: 'p29', artisanId: 'a2', categoryId: 'c2', priceInr: 1100, images: 3, status: 'approved', createdAt: '2025-07-27T10:00:00.000Z',
    title: 'Blue pottery drawer knobs, set of six',
    description:
      'Six hand-painted ceramic drawer knobs with brass fittings. No two are exactly alike.' },
  { id: 'p30', artisanId: 'a1', categoryId: 'c1', priceInr: 12400, images: 5, status: 'rejected', createdAt: '2025-06-05T10:00:00.000Z',
    title: 'Kutchi wool floor rug',
    description:
      'A flat-weave rug in undyed black and white wool, woven in two panels and joined down the centre.' },
]

export const products: Product[] = productSeeds.map(({ images, ...rest }) => ({
  ...rest,
  imageUrls: gallery(rest.id, images, rest.categoryId),
}))
