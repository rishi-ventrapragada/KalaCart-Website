/**
 * The maker fan's geometry, as pure functions.
 *
 * The part of the adopted BounceCards worth keeping (CLAUDE.md §I step 8: pure
 * maths comes out into its own module). Cards are dealt along a shallow arc -
 * a lateral offset gives the spread, a small rotation gives the hand-dealt
 * tilt - and hovering one card pushes its neighbours aside to clear it.
 *
 * Kept separate from the hook that tweens it because it is the piece with
 * arithmetic in it: a placement bug is findable here by reading, with no GSAP
 * timeline or DOM node in the picture. The hook stays about lifecycle, this
 * stays about position.
 *
 * THE SOURCE'S NUMBERS ARE GONE, and deliberately. It hardcoded five absolute
 * transforms (`rotate(10deg) translate(-170px)` and so on) against a fixed
 * 400x400 box, which cannot survive a responsive layout: at 360px those five
 * 200px cards spread across 340px of travel and overflow the viewport, and the
 * acceptance sweep fails horizontal overflow outright (PRD §14). Deriving the
 * spread from the measured width instead means the fan cannot overflow, and the
 * card count stops being baked into an array literal.
 */

export interface FanGeometry {
  /** Card edge length in pixels at rest, before the responsive fit. */
  cardSize: number
  /** Lateral gap between adjacent card centres, in pixels. */
  spread: number
  /** Degrees of tilt between one card and the next. */
  tiltStep: number
  /** Vertical sag in pixels at the ends of the arc, giving the fan its curve. */
  arc: number
  /** How far a neighbour slides aside to clear a hovered card, in pixels. */
  pushDistance: number
  /** Scale applied to the card under the pointer. */
  hoverScale: number
}

/** What the hook tweens one card to. No DOM here, just the numbers. */
export interface FanTransform {
  x: number
  y: number
  rotation: number
  scale: number
  zIndex: number
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/**
 * How much the whole fan shrinks to fit its container.
 *
 * The fan is specified in absolute pixels, so on a narrow column it would
 * otherwise overflow - and overflow is the one thing the sweep fails outright.
 * Measuring the box and scaling the spread down keeps the geometry declarative
 * and the overflow impossible, rather than needing a media query per
 * breakpoint. Mirrors `fitScale` in the spiral.
 *
 * The total width a fan wants is the spread across `count - 1` gaps plus one
 * card, and the rotation adds a little beyond that - hence the margin.
 */
export function fanFitScale(
  containerWidth: number,
  count: number,
  geometry: FanGeometry,
): number {
  if (count <= 0) return 1
  const wanted = geometry.spread * (count - 1) + geometry.cardSize * 1.25
  return clamp(containerWidth / Math.max(wanted, 1), 0.55, 1)
}

/**
 * Offset from the centre of the fan, in card positions.
 *
 * Fractional for an even count - four cards straddle the centre line rather
 * than one sitting on it - which is what keeps the fan symmetrical whatever
 * the artisan count turns out to be. The source could not do this: its five
 * transforms were written out by hand, so a sixth approved artisan would have
 * rendered at `transform: none`, stacked dead centre under the others.
 */
export function centreOffset(index: number, count: number): number {
  return index - (count - 1) / 2
}

/**
 * Place one card at rest.
 *
 * Everything derives from the card's offset from centre: lateral position, the
 * tilt, and the vertical sag that turns a straight row into an arc. One number
 * and the geometry, with no per-card state to keep in sync.
 */
export function restingTransform(
  index: number,
  count: number,
  fit: number,
  geometry: FanGeometry,
): FanTransform {
  const offset = centreOffset(index, count)
  const half = Math.max((count - 1) / 2, 1)
  const edge = Math.abs(offset) / half

  return {
    x: offset * geometry.spread * fit,
    // Squared so the sag is flat through the middle and falls away at the ends,
    // which reads as an arc rather than as a V.
    y: edge * edge * geometry.arc * fit,
    rotation: offset * geometry.tiltStep,
    scale: 1,
    // Centre cards paint over their neighbours, so the fan reads as dealt from
    // the middle outward rather than as a stack leaning one way.
    zIndex: Math.round((half - Math.abs(offset)) * 10),
  }
}

/**
 * Place one card while `hovered` is under the pointer.
 *
 * The hovered card straightens, lifts and rises to the top of the stack; every
 * other card slides away from it to clear the space. The push is signed by
 * which side the card sits on, so the fan opens symmetrically.
 *
 * The source pushed every neighbour by a flat ±160px, which double-counts on
 * the far side: a card already three positions away is shoved as hard as the
 * one adjacent, and the fan tears open at the ends. Falling the push off with
 * distance keeps the movement local to the hovered card, which is the thing
 * the gesture is meant to reveal.
 */
export function hoveredTransform(
  index: number,
  count: number,
  hovered: number,
  fit: number,
  geometry: FanGeometry,
): FanTransform {
  const rest = restingTransform(index, count, fit, geometry)
  if (index === hovered) {
    return {
      ...rest,
      y: rest.y - geometry.arc * 0.5 * fit,
      rotation: 0,
      scale: geometry.hoverScale,
      // Above every resting card, whatever the count.
      zIndex: count * 10 + 10,
    }
  }

  const distance = Math.abs(index - hovered)
  const direction = index < hovered ? -1 : 1
  // Falls off with distance so the push stays local to the hovered card.
  const falloff = 1 / distance

  return {
    ...rest,
    x: rest.x + direction * geometry.pushDistance * falloff * fit,
  }
}

/**
 * Whether a geometry actually clears the hovered card.
 *
 * THE INVARIANT: with any card hovered, its immediate neighbours must be pushed
 * far enough that they no longer cover it. The whole point of the gesture is to
 * reveal one maker's portrait and name; a push that leaves the neighbour still
 * overlapping produces a card that lifts and scales but stays half-hidden,
 * which reads as a rendering glitch rather than as a geometry mistake - so it
 * would survive a screenshot review the same way the spiral's paint-order bug
 * did.
 *
 * Checked at module load in development, like `frontCardIsClear`.
 */
export function hoveredCardIsClear(geometry: FanGeometry, count: number): boolean {
  if (count < 2) return true

  for (let hovered = 0; hovered < count; hovered += 1) {
    const focus = hoveredTransform(hovered, count, hovered, 1, geometry)
    const focusHalf = (geometry.cardSize * focus.scale) / 2

    for (let index = 0; index < count; index += 1) {
      if (index === hovered) continue
      // Only the immediate neighbours can realistically cover it; further cards
      // are already a full spread away.
      if (Math.abs(index - hovered) > 1) continue

      const other = hoveredTransform(index, count, hovered, 1, geometry)
      const gap = Math.abs(other.x - focus.x)
      if (gap < focusHalf + geometry.cardSize / 2) return false
    }
  }

  return true
}
