import { useMemo } from 'react'

import { useSpiralRotation } from '@/components/motion/useSpiralRotation'
import { RemoteImage } from '@/components/ui/RemoteImage'
import { getProducts } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { orderForSpiral } from '@/lib/home/spiralOrder'
import { frontCardIsClear } from '@/lib/home/spiralInvariant'
import { type SpiralGeometry } from '@/lib/home/spiralTransform'

/**
 * Ten cards, which is the source's own count and what fills the helix.
 *
 * Density comes from `verticalSpacing` and card size, not from this number: the
 * helix is taller than its box either way, so extra cards extend it into the
 * masked ends rather than tightening what you can see.
 */
const CARD_COUNT = 10

const CARD_WIDTH = 104
const CARD_HEIGHT = 104

/**
 * The helix. Frozen at module scope rather than built per render: it is the
 * rotation effect's dependency, and a fresh object each render would tear the
 * loop down and restart it, resetting the rotation to zero every time Home
 * re-renders.
 *
 * These sit close to the source's defaults (radius 170, 100px cards, spacing
 * 60, 7 per turn, centre scale 1.2) because that is the density the spiral is
 * designed around: cards overlap by about 60% at the tightest, which is what
 * packs them into a helix instead of spreading them into a thin ribbon.
 *
 * An earlier pass read that overlap as a collision and pushed `verticalSpacing`
 * to 140 to eliminate it. That removed the overlap and the spiral with it - the
 * cards spread over 980px of travel inside a 544px box, so barely half of them
 * were ever visible at once. Overlap is the depth cue here; what actually
 * needed fixing was the *order* it is painted in, which `frontCardIsClear`
 * now guards.
 */
const GEOMETRY: SpiralGeometry = {
  radius: 165,
  verticalSpacing: 56,
  cardsPerTurn: 7,
  perspective: 1000,
  centerScale: 1.2,
  edgeFade: 0.3,
  edgeBlur: 6,
}

/*
 * The paint-order contract, checked at module load in development.
 *
 * The failure this guards against looks like a rendering glitch rather than a
 * geometry mistake: on scattered frames two overlapping cards swap which is on
 * top, so they appear to merge for an instant. Nobody files that as a bug in
 * the numbers, because the numbers look fine. Asserting it here means a later
 * change to spacing, card count or turn size fails loudly at the source.
 */
if (import.meta.env.DEV && !frontCardIsClear(GEOMETRY, CARD_COUNT)) {
  throw new Error(
    'HeroSpiral: the front card is painted under a card it overlaps — ' +
      'cards will appear to merge as they come round the front of the helix.',
  )
}

/** Cards per second. Slow enough to read as drift rather than as a carousel. */
const SPEED = 0.14

const fetchNewest = () => getProducts({ sort: 'newest' })

/**
 * A slow spiral of real product photography beside the hero headline.
 *
 * WHY PHOTOGRAPHY IS ALLOWED HERE when the illustrated motifs were not: the
 * rejected jharokha arches, loom and dye washes were *drawn subjects* that
 * argued with the Fraunces headline for the page's voice, and were rejected
 * partly for dating badly against exactly this photography. This is not a
 * competing subject - it is the goods, the same frames Browse renders. It also
 * sits in its own column beside the copy rather than underneath it, so nothing
 * overlaps the reading measure and the grain's legibility mask is untouched.
 *
 * ABSENT UNTIL READY. The hero has no loading state and gains none: the
 * headline column paints immediately and independently, so first paint and LCP
 * are unaffected, and the spiral fades in when its data lands. On error it
 * renders nothing at all, silently. That is a deliberate exception to the
 * three-states rule, on the grounds that this is decoration rather than a data
 * view - a retry button in the hero for a flourish would be worse than its
 * absence, and the same reasoning already governs `RemoteImage`.
 *
 * DECORATIVE, so the whole subtree is `aria-hidden` and nothing in it is
 * focusable. The headline and its CTA carry the meaning and the action; the
 * adopted source announced eight list items labelled "Spiral image 1..8" and
 * put rotating links in the tab order, which is noise that would have passed
 * the sweep's `img has alt` check while being actively worse than silence.
 */
export function HeroSpiral() {
  const products = useAsyncData(fetchNewest)

  const items = useMemo(
    () => orderForSpiral(products.data ?? [], CARD_COUNT),
    [products.data],
  )

  const { rootRef, setCardRef } = useSpiralRotation({
    geometry: GEOMETRY,
    speed: SPEED,
    cardWidth: CARD_WIDTH,
    cardHeight: CARD_HEIGHT,
    count: items.length,
  })

  // Nothing to show, and nothing to say about it: no skeleton, no error, no
  // reserved-then-filled box. The grid cell holds the space either way.
  if (items.length === 0) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-spiral
      className="hero-spiral relative isolate hidden h-[34rem] w-full lg:block"
    >
      {items.map((product, index) => (
        <div
          key={product.id}
          ref={setCardRef(index)}
          className="hero-spiral__card"
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        >
          <RemoteImage
            src={product.imageUrls[0] ?? ''}
            alt=""
            wrapperClassName="size-full rounded-[inherit]"
          />
        </div>
      ))}
    </div>
  )
}
