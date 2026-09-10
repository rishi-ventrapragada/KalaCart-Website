import type { Product } from '@/lib/data'

/**
 * Which crafts photograph as OBJECTS, and which photograph as SCENES.
 *
 * This is a finding about the fixture pool, not a ranking of the crafts. The
 * frames were checked by eye at the sizes the spiral actually renders them
 * (~130px at the front, ~88px at the back):
 *
 * - Blue Pottery, Madhubani and Brassware are shot close, one object filling
 *   the frame. They stay legible all the way down.
 * - Handloom, Block Printing and Bamboo are shot wide - an artisan at a loom,
 *   a printer over a table, a vendor in a stall. The craft is somewhere in a
 *   busy scene, and below about 110px it dissolves into an indistinct
 *   brown-and-cream texture. Block printing at 88px is a blue rectangle.
 *
 * So the ordering puts object-forward frames where the spiral is large and
 * sharp, and lets the scene frames sit toward the back where the edge blur is
 * already abstracting them into colour and depth. Nothing is excluded: all six
 * crafts appear, which matters for a platform whose pitch is the breadth of
 * what it carries.
 *
 * This is a per-photo ordering choice within the existing pool. It changes no
 * fixture, and Browse and the featured grid - which render at full card size,
 * where the scene frames read fine - are untouched.
 */
const OBJECT_FORWARD: readonly string[] = ['c2', 'c3', 'c4']

/**
 * Orders products so the front of the spiral carries the crops that survive
 * being small, and interleaves the rest behind them.
 *
 * `cardTransform` places index 0 at the centre and works outward, so source
 * order is depth order: the earlier a product sits in this array, the closer to
 * the viewer it renders.
 */
export function orderForSpiral(products: Product[], count: number): Product[] {
  const objects: Product[] = []
  const scenes: Product[] = []

  for (const product of products) {
    if (OBJECT_FORWARD.includes(product.categoryId)) objects.push(product)
    else scenes.push(product)
  }

  // Front half from the object-forward pool, back half from the scenes, each
  // falling back to the other if one runs short - so a catalogue that happens
  // to hold only textiles still fills the spiral rather than rendering a gap.
  const frontCount = Math.ceil(count / 2)
  const front = objects.slice(0, frontCount)
  const back = scenes.slice(0, count - front.length)
  const remainder = [...objects.slice(front.length), ...scenes.slice(back.length)]

  return [...front, ...back, ...remainder].slice(0, count)
}
