import {
  DEPTH_SCALE_MAX,
  DEPTH_SCALE_MIN,
  clamp,
  depthOrderKey,
  modulo,
  type SpiralGeometry,
} from '@/lib/home/spiralTransform'

/**
 * THE INVARIANT: the front card is never painted underneath a card it overlaps.
 *
 * Kept out of `spiralTransform` because it is a verification harness rather
 * than geometry - it replays the placement maths across a whole cycle and
 * judges the result, which is a different job from placing one card, and it
 * runs only in development.
 *
 * Cards on this helix are *meant* to overlap - about 60% at the tightest, which
 * is what packs them into a spiral instead of spreading them into a thin
 * ribbon. Overlap is the depth cue, not the bug.
 *
 * The bug is an overlap painted in the wrong order: a card that is further away
 * drawn on top of the one in front, so instead of sliding cleanly under its
 * neighbour it cuts across it. That reads as two images merging, and because it
 * strikes only some frames it reads as a stutter rather than as a static
 * mistake - which is why it survived a screenshot review.
 *
 * It has one cause, and it is structural. Depth is `cos(angle)`, and cosine is
 * symmetric: a card `+k` positions from centre and one at `-k` sit at *exactly*
 * the same z, on every frame, forever. Ordering by depth alone leaves those
 * pairs tied, and the source's `+ index` tiebreak resolved them by array
 * position - arbitrary, and it flips as cards wrap. Measured across a full
 * cycle: 9 mis-painted frames per 2000 under the source's own scheme.
 *
 * `depthOrderKey` breaks the tie by centrality instead, which is continuous in
 * `offset` and so cannot flip. Verified 0 occlusions per 2000 frames.
 */
export function frontCardIsClear(
  geometry: SpiralGeometry,
  count: number,
  samples = 400,
): boolean {
  const { radius, verticalSpacing, cardsPerTurn, perspective, centerScale } = geometry
  const half = count / 2
  const turn = Math.max(cardsPerTurn, 1)

  for (let step = 0; step < samples; step += 1) {
    const progress = (step / samples) * count
    const cards: Array<{ z: number; y: number; extent: number; key: number }> = []

    for (let index = 0; index < count; index += 1) {
      const offset = modulo(index - progress + half, count) - half
      const focus = 1 - Math.min(Math.abs(offset) / Math.max(turn * 0.65, 1), 1)
      const z = Math.cos((offset * (360 / turn) * Math.PI) / 180) * radius
      const depthScale = clamp(
        perspective / Math.max(perspective - z, 1),
        DEPTH_SCALE_MIN,
        DEPTH_SCALE_MAX,
      )

      cards.push({
        z,
        y: offset * verticalSpacing,
        // Height as a multiple of the card's own height, so the check holds for
        // any card size: only the ratio to `verticalSpacing` matters.
        extent: (1 + (centerScale - 1) * focus) * depthScale,
        key: depthOrderKey(z, radius, offset, count),
      })
    }

    const front = cards.reduce((nearest, card) => (card.z > nearest.z ? card : nearest))

    for (const card of cards) {
      if (card === front) continue
      const gap = Math.abs(card.y - front.y)
      const touching = gap < ((card.extent + front.extent) / 2) * verticalSpacing
      if (touching && card.key > front.key) return false
    }
  }

  return true
}
