import { useMemo } from 'react'

import { useSpiralRotation } from '@/components/motion/useSpiralRotation'
import { RemoteImage } from '@/components/ui/RemoteImage'
import { getProducts } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { orderForSpiral } from '@/lib/home/spiralOrder'
import { hasCardSeparation, type SpiralGeometry } from '@/lib/home/spiralTransform'

/** Enough to read as endless, few enough that every card is a real listing. */
const CARD_COUNT = 8

const CARD_WIDTH = 112
const CARD_HEIGHT = 112

/**
 * The helix. Frozen at module scope rather than built per render: it is the
 * rotation effect's dependency, and a fresh object each render would tear the
 * loop down and restart it, resetting the rotation to zero every time Home
 * re-renders.
 *
 * `verticalSpacing` is the load-bearing number. It must stay at or above the
 * largest on-screen height a card can reach, or neighbours collide as they come
 * round the front - the cards stop reading as objects on a helix and start
 * reading as a stack being shuffled. The first pass had 132px cards rising only
 * 58px, which overlapped them by 74px at rest and by 125px at the front of the
 * turn: an overlap on every single frame. Spacing now clears the card at its
 * largest, so the separation holds at every rotation.
 *
 * The horizontal swing cannot be relied on to keep them apart. It is a sine, so
 * twice a turn it passes through zero - and at exactly those moments a card is
 * directly above its neighbour with only this spacing between them.
 */
const GEOMETRY: SpiralGeometry = {
  radius: 150,
  verticalSpacing: 140,
  cardsPerTurn: 6,
  perspective: 1000,
  centerScale: 1.08,
  edgeFade: 0.32,
  edgeBlur: 5,
}

/*
 * The no-overlap contract, checked at module load in development.
 *
 * The geometry above is hand-tuned, and the failure it guards against is one
 * that looks like a design choice rather than a bug - overlapping cards read as
 * a deliberate stack, so nobody files it. Asserting it here means a later tweak
 * to spacing, card size or centre scale fails loudly at the source instead of
 * being noticed weeks later in a screenshot.
 */
if (import.meta.env.DEV && !hasCardSeparation(GEOMETRY, CARD_HEIGHT)) {
  throw new Error(
    'HeroSpiral: verticalSpacing is too small for the card size and centreScale — ' +
      'cards will overlap as they come round the front of the helix.',
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
