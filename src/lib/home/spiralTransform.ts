/**
 * The spiral's geometry, as pure functions.
 *
 * This is the part of the adopted component that was worth keeping (CLAUDE.md
 * §I step 8: pure maths comes out into its own module). Cards are placed around
 * a vertical helix - sine and cosine give the horizontal swing and the depth,
 * the index offset gives the vertical rise - and depth is expressed as scale,
 * fade and blur rather than as a real 3D translation.
 *
 * Kept separate from the loop that calls it because it is the piece with actual
 * arithmetic in it: a placement bug is findable here by reading, without a
 * requestAnimationFrame or a DOM node anywhere in the picture. The hook stays
 * about lifecycle, this stays about position.
 */

export interface SpiralGeometry {
  /** Radius of the helix in pixels, before the responsive fit is applied. */
  radius: number
  /** Vertical rise between one card and the next, in pixels. */
  verticalSpacing: number
  /** How many cards complete one full turn of the helix. */
  cardsPerTurn: number
  /** Perspective distance, matching the CSS `perspective` on the root. */
  perspective: number
  /** Scale multiplier applied to the card nearest the viewer. */
  centerScale: number
  /** Fraction of the run over which cards fade out at the ends. */
  edgeFade: number
  /** Maximum blur in pixels, applied to the cards furthest from centre. */
  edgeBlur: number
}

/** What the loop writes to one card. No DOM here, just the numbers. */
export interface CardTransform {
  transform: string
  opacity: number
  /** Pixels of blur; zero means the filter is dropped entirely. */
  blur: number
  zIndex: number
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/** Positive modulo, so a card wrapping past the end lands back at the start. */
export const modulo = (value: number, divisor: number): number =>
  ((value % divisor) + divisor) % divisor

const smoothstep = (min: number, max: number, value: number): number => {
  const x = clamp((value - min) / (max - min || 1), 0, 1)
  return x * x * (3 - 2 * x)
}

/**
 * How much the whole spiral shrinks to fit its container.
 *
 * The helix is specified in absolute pixels, so on a narrow column it would
 * otherwise overflow - and an overflowing hero is the one thing the acceptance
 * sweep fails outright (PRD §14, no horizontal scroll at 360px). Measuring the
 * box and scaling everything down keeps the geometry declarative and the
 * overflow impossible, rather than relying on a media query per breakpoint.
 */
export function fitScale(
  width: number,
  height: number,
  cardWidth: number,
  cardHeight: number,
): number {
  return Math.min(1, width / (cardWidth * 2.8), height / (cardHeight * 2.35))
}

/** The helix radius after the responsive fit, in pixels. */
export function fittedRadius(radius: number, width: number, fit: number): number {
  return Math.min(radius, Math.max(72, width * 0.36)) * fit
}

/**
 * Paint order for one card: depth first, centrality to break the tie.
 *
 * Depth is `cos(angle)`, and cosine is symmetric, so the cards at `+k` and `-k`
 * positions from centre sit at *exactly* the same z on every frame. Depth alone
 * therefore cannot order them, and whatever resolves that tie decides which of
 * the two is drawn on top when they overlap.
 *
 * The source resolved it with `+ index`, i.e. by position in the array. That is
 * arbitrary - it has nothing to do with where the card is on the helix - and it
 * flips whenever a card wraps, which is what made overlapping cards cut across
 * each other on scattered frames instead of sliding under.
 *
 * Centrality resolves it by *how close to the front of the run* a card is, which
 * is the property that should win: of two cards at equal depth, the one nearer
 * the middle of the visible spiral is the one the eye reads as nearer. It is
 * also continuous in `offset`, so the order changes by sliding rather than by
 * popping. The centrality term is scaled to stay well under one depth step, so
 * it can only ever separate a tie, never reorder genuinely different depths.
 */
export function depthOrderKey(
  z: number,
  responsiveRadius: number,
  offset: number,
  count: number,
): number {
  const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2
  const centrality = 1 - Math.min(Math.abs(offset) / Math.max(count / 2, 1), 1)
  return Math.round(depth * 100000 + centrality * 999)
}

/**
 * Bounds on the perspective foreshortening, and the depth read itself: a front
 * card renders about 1.6x the height of one at the back, which is what makes
 * the helix look like a helix rather than a flat ring of even tiles.
 *
 * The first port clamped these to (0.8, 1.12) to satisfy a no-overlap rule,
 * flattening that ratio to 1.37x and leaving fade and blur to carry a cue scale
 * should have carried. Overlap is not the failure - see `frontCardIsClear`.
 */
export const DEPTH_SCALE_MIN = 0.72
export const DEPTH_SCALE_MAX = 1.45

/**
 * The largest on-screen height a card can reach, in pixels.
 *
 * Still exported, but as a sizing aid rather than as a separation rule: it says
 * how tall the front card gets, which is what the container has to have room
 * for. It no longer implies anything about `verticalSpacing`.
 */
export function maxCardExtent(cardHeight: number, centerScale: number): number {
  return cardHeight * centerScale * DEPTH_SCALE_MAX
}

/*
 * The paint-order invariant that governs this geometry lives in
 * `spiralInvariant.ts` - it replays these maths across a full cycle and judges
 * the result, which is verification rather than placement.
 */

/**
 * Place one card. `progress` is the spiral's rotation in card-widths: advancing
 * it by one moves every card up exactly one position.
 *
 * The card's own offset from centre drives everything - horizontal swing, rise,
 * scale, fade and blur - so the whole look is a function of one number and the
 * geometry, with no per-card state to keep in sync.
 */
export function cardTransform(
  index: number,
  count: number,
  progress: number,
  fit: number,
  responsiveRadius: number,
  geometry: SpiralGeometry,
): CardTransform {
  const { verticalSpacing, cardsPerTurn, perspective, centerScale, edgeFade, edgeBlur } = geometry

  const half = count / 2
  // Offset from the centre of the run, wrapped so the spiral is endless.
  const offset = modulo(index - progress + half, count) - half
  const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1)
  const turnSize = Math.max(cardsPerTurn, 1)

  const fadeStart = clamp(1 - edgeFade, 0, 0.98)
  const opacity = 1 - smoothstep(fadeStart, 1, edge)

  // Focus falls off within about two thirds of a turn either side of centre, so
  // the front card is emphasised without the ones beside it collapsing.
  const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1)
  const scale = (1 + (centerScale - 1) * focus) * fit

  const angle = offset * (360 / turnSize)
  const angleRadians = (angle * Math.PI) / 180
  const x = Math.sin(angleRadians) * responsiveRadius
  const z = Math.cos(angleRadians) * responsiveRadius

  /*
   * Depth is faked through scale rather than a real translateZ: the cards stay
   * in the compositor's flat plane, which keeps the blur cheap and avoids the
   * z-fighting a genuine preserve-3d stack gets at these small separations.
   *
   * The upper bound matters for more than looks. A card's on-screen height is
   * `cardHeight * scale * depthScale`, and two neighbours are only
   * `verticalSpacing` apart - so if the front card can inflate without limit it
   * grows down into the card behind it and the spiral reads as a shuffling
   * stack rather than as separate objects on a helix. `DEPTH_SCALE_MAX` is
   * therefore part of the no-overlap contract that `maxCardExtent` checks, not
   * a free tuning knob: raising it re-introduces the collision.
   */
  const depthScale = clamp(
    perspective / Math.max(perspective - z, 1),
    DEPTH_SCALE_MIN,
    DEPTH_SCALE_MAX,
  )
  const y = offset * verticalSpacing * fit

  return {
    transform:
      `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
      `scale(${(scale * depthScale).toFixed(4)})`,
    opacity,
    blur: edgeBlur * smoothstep(0.35, 1, edge),
    zIndex: depthOrderKey(z, responsiveRadius, offset, count),
  }
}
