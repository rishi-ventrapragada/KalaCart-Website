import type { CSSProperties } from 'react'

import { ArtisanCard } from '@/components/home/ArtisanCard'
import { useBounceFan } from '@/components/motion/useBounceFan'
import type { Artisan, Category } from '@/lib/data'
import { type FanGeometry, hoveredCardIsClear } from '@/lib/home/fanTransform'
import { useT } from '@/lib/i18n'

interface BounceFanProps {
  artisans: Artisan[]
  categories: Category[]
}

/**
 * The fan's geometry. Frozen at module scope rather than built per render: it
 * is the entrance effect's dependency, and a fresh object each render would
 * tear the timeline down and re-deal the cards on every re-render of Home.
 *
 * `cardSize` IS THE LARGEST FIVE CARDS FIT, not a ratio of anything. A product
 * card in "Recently listed" is 264px, and matching that exactly was asked for
 * and is not possible here: five 264px cards need ~1346px of column, while the
 * fan gets 1104px at 1280 (capped by the shared `max-w-6xl` Container) and
 * 976px at the `lg` breakpoint itself. 218 is where five cards stop fitting the
 * wide column, so the fan reads at about 0.83 of a product card rather than 1.0.
 *
 * `pushDistance` is checked by `hoveredCardIsClear` rather than chosen by eye:
 * at this spread the push clears the hovered card from 18px upward, so 104 sits
 * far clear of the floor without throwing the far cards off the arc.
 *
 * `spread` IS SET BY THE TEXT, not by how the overlap looks. A card's name and
 * craft are centred, so the widest block it could hold is its own inner width -
 * 186px, being 218px less `p-4` on both sides. For a neighbour never to cover
 * that block, its near edge must sit at least half the block plus a margin from
 * this card's centre: `spread >= 109 + 93 + 6 = 208`.
 *
 * TREAT THAT FIGURE AS AN UPPER BOUND ON DEMAND, NOT AS A PREDICTION OF
 * CLIPPING. It assumes the text fills the full inner width, when the real names
 * are narrower than that and centred, and it ignores the neighbour's own
 * padding being empty. Measured against the live page it is consistently
 * pessimistic: the previous geometry sat 3.5px *under* this rule at the narrow
 * column and still covered zero text pixels. So the rule ranks candidates, and
 * the glyph test - hit-testing every rendered character against the cards in
 * front of it - is what actually settles whether a size ships.
 *
 * `fanFitScale` compresses SPREAD and never `cardSize`, so the cards stay 218px
 * at every width and only the gaps tighten: about 208 at 1280 and 184 at the
 * 1024 breakpoint. That narrow case is the one to re-check on any change here,
 * because it is where the gaps are tightest while the type stays the same size.
 *
 * An earlier pass got this wrong twice over. It sized the cards at 132px, then
 * kept a 0.818 spread-to-card ratio on the theory that the ratio preserved the
 * look - but that ratio put the neighbour's edge 57px from centre, covering
 * everything past a 102px block, so "Hansaben Vankar" rendered as "Hansaben
 * Vanka" and "Budhram Baghel" lost its B. Overlap is still the point of a fan;
 * it just has to fall on the portrait, which is centred, rather than on the
 * type beneath it.
 */
const GEOMETRY: FanGeometry = {
  cardSize: 218,
  spread: 208,
  tiltStep: 4,
  arc: 24,
  pushDistance: 104,
  hoverScale: 1.06,
}

/** Seconds between one card's entrance and the next. ~80ms, the PRD 10.3 beat. */
const STAGGER = 0.08

/*
 * The hover contract, checked at module load in development.
 *
 * The failure this guards is quiet: a push too small leaves the hovered card
 * lifted and scaled but still half-covered by its neighbour, which reads as a
 * rendering glitch rather than as a number being wrong. Asserting it here means
 * a later change to spread, card size or push fails loudly at the source
 * instead of being noticed - or not - by eye.
 */
if (import.meta.env.DEV && !hoveredCardIsClear(GEOMETRY, 5)) {
  throw new Error(
    'BounceFan: hovering a card does not clear its neighbours — ' +
      'the lifted card will stay partly covered by the card beside it.',
  )
}

/**
 * The featured makers, dealt as a fan (PRD 11.2).
 *
 * Adopted from an external BounceCards component under CLAUDE.md §I. What
 * survived is the idea - overlapping cards that spread on hover - and the
 * lifecycle shape. What did not: the hardcoded 400x400 box and five absolute
 * transforms (replaced by measured, count-derived geometry, because five fixed
 * 200px cards overflow a 360px viewport and the sweep fails that outright), the
 * overshoot easings (one site curve), the raw `border-white` and
 * `rgba(0,0,0,.2)` shadow (semantic tokens; no shadow token exists and a fan
 * does not justify inventing one), and `alt="card-0"` on every image.
 *
 * DESKTOP ONLY, by construction rather than by preference. A fan is a pointer
 * gesture: it needs hover to open, and it overlaps its own cards by design, so
 * on a touch screen it would present five artisans of whom three are partly
 * covered and none can be revealed. `ArtisanRow` renders the plain grid below
 * `lg` and this above it, and both read the same data.
 *
 * KEYBOARD PARITY IS NOT OPTIONAL HERE, unlike the hero spiral. These cards are
 * real links to real artisan profiles, so the push fires on `focus` as well as
 * pointer entry: tabbing through the fan opens it card by card exactly as the
 * mouse does, and the focused card is never left underneath a neighbour. The
 * source bound `onMouseEnter`/`onMouseLeave` only.
 */
export function BounceFan({ artisans, categories }: BounceFanProps) {
  const t = useT()
  const { rootRef, setCardRef, push } = useBounceFan({
    geometry: GEOMETRY,
    count: artisans.length,
    stagger: STAGGER,
  })

  return (
    <div
      ref={rootRef}
      aria-label={t('home.artisans.fanLabel')}
      // The card size reaches the stylesheet as a variable rather than being
      // restated there: the CSS centres each card on its own middle, which
      // needs the same number the geometry places them with.
      style={{ '--fan-card-size': `${String(GEOMETRY.cardSize)}px` } as CSSProperties}
      // `onBlur`/`onFocus` bubble, so the fan closes when focus leaves the
      // group entirely rather than on every card-to-card move within it.
      onMouseLeave={() => {
        push(null)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) push(null)
      }}
      // Tall enough for a 180px card lifted and scaled at the top of the arc,
      // plus the sag at the ends, so the fan never clips against its own box.
      className="bounce-fan relative hidden h-[19rem] w-full lg:block"
    >
      {artisans.map((artisan, index) => (
        <div
          key={artisan.id}
          ref={setCardRef(index)}
          className="bounce-fan__card"
          style={{ width: GEOMETRY.cardSize, height: GEOMETRY.cardSize }}
          onMouseEnter={() => {
            push(index)
          }}
          onFocus={() => {
            push(index)
          }}
        >
          <ArtisanCard
            artisan={artisan}
            category={categories.find((c) => c.id === artisan.categoryId)}
            compact
          />
        </div>
      ))}
    </div>
  )
}
