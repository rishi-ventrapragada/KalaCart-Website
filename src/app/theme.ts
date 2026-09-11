/**
 * The two palettes (PRD sections 9.1 and 9.2).
 *
 * This file is the ONLY place hex values live. Components use the semantic
 * Tailwind classes those tokens back (bg-canvas, text-ink, border-line,
 * text-accent) and never a raw colour (CLAUDE.md law 3).
 *
 * The PRD names its two palettes asymmetrically: light has ink/brand/highlight,
 * dark has text/accent/secondary. A semantic seam needs one set of names that
 * reads correctly in both, so each theme maps onto the canonical set below.
 * `accent` therefore means indigo in light and brass in dark - PRD 9.2 states
 * that difference in accent logic is intentional, so the token encodes the
 * ROLE, not the hue.
 */

export type ThemeName = 'light' | 'dark'

export interface ThemeTokens {
  /** Page background. */
  canvas: string
  /** Raised surfaces: cards, panels, modals. */
  card: string
  /** Primary text. */
  ink: string
  /** Secondary text. */
  muted: string
  /** Decorative hairlines and dividers. Non-functional, so no contrast floor. */
  line: string
  /**
   * Functional boundaries: input borders, interactive card edges, focus
   * targets. Clears WCAG AA 3:1 for UI components against BOTH canvas and card
   * in each theme (measured, Increment 5).
   */
  lineStrong: string
  /** The single accent per theme. Glows and highlights only (PRD 9.6). */
  accent: string
  /** Accent at rest under hover or pressed states. */
  accentDeep: string
  /**
   * A second signal for borders, dots and chips. NEVER a text or label colour:
   * both themes' values are mid-tone and fail AA against light and dark
   * surfaces alike (Increment 5). Labels on a secondary fill use `ink`.
   */
  secondary: string
  /**
   * A full-bleed band that deliberately breaks from the page ground, so a
   * section reads as a held moment rather than more scroll.
   *
   * It means CONTRASTING, not dark, and the two themes move in opposite
   * directions: light goes darker than its parchment canvas, dark goes LIGHTER
   * than its charcoal one. A literally dark strip on the dark theme's #121212
   * would be an invisible band.
   */
  surfaceContrast: string
  /**
   * Text on `surfaceContrast`, and the reason that band needs a token pair.
   *
   * Because the ground inverts in light but not in dark, a component painting
   * on it cannot name `ink` or `canvas` and be right in both themes. This slot
   * resolves the direction in the palette instead, so the component stays
   * declarative: it is `canvas` in light (13.72:1 on the band) and `ink` in
   * dark (13.26:1), both measured.
   *
   * NOTE: `accent` measures only 2.97:1 on the light band. Nothing on this
   * surface may use the accent as a text colour - including SectionHeader's
   * optional "see all" link, which is why ImpactBand passes none.
   */
  onSurfaceContrast: string
}

/**
 * Light "Raw Cotton": warm terracotta on parchment (PRD 9.1, revised 2026-09-10).
 *
 * Every value below is a measured one, not a picked one. The ratios quoted are
 * WCAG against the surfaces the token actually meets in the UI.
 */
export const lightTheme: ThemeTokens = {
  canvas: '#F6E9DF',
  // Barely off-white rather than pure #FFFFFF: on a parchment canvas a pure
  // white card reads as a hole punched in the page rather than a raised surface.
  card: '#FFFDFB',
  // Espresso, not black. 11.42:1 on canvas, 13.39:1 on card.
  ink: '#3C2A21',
  // 5.79:1 on canvas, 6.79:1 on card - clears the 4.5 body floor on both.
  muted: '#6B5647',
  line: '#E7D7C9',
  // The functional-boundary floor is 3:1 against BOTH surfaces, and that is
  // what pins this value. The palette's own mid-brown (#A8846B) measures
  // 2.86:1 on canvas and fails; this is the first step darker that clears both
  // (3.73:1 canvas, 4.38:1 card).
  lineStrong: '#957055',
  /*
   * Terracotta. Set by the primary button, not by eye: `primary` is
   * `bg-accent text-canvas`, so the canvas-on-accent label carries the 4.5
   * floor. The reference swatch #B55D3D measures 3.84:1 there and fails; this
   * is the first step darker that clears it (4.61:1), and it doubles as the
   * focus-ring colour at the same 4.61:1 against canvas.
   */
  accent: '#A55133',
  accentDeep: '#8F4529',
  /*
   * Stays a red, and deliberately NOT the palette's sage.
   *
   * `secondary` is not a decorative slot: it is the invalid-field border
   * (fieldStyles), the error-toast border (Toast) and the destructive confirm
   * fill (buttonStyles) behind "reject artisan". A calm green cannot carry any
   * of those meanings, and sage also measures 2.28:1 as a border on canvas,
   * under the 3:1 boundary floor. Madder measures 5.37:1 on canvas and 6.29:1
   * on card. The palette's sage lives on as a `dyes` entry instead.
   */
  secondary: '#A63A3A',
  /*
   * Espresso deepened one step past `ink`, and set by the label floor rather
   * than picked. The band's copy is `canvas`, so canvas-on-band carries the 4.5
   * floor: this measures 13.72:1, with `card` at 16.10:1 for anything raised.
   *
   * Deeper than `ink` (#3C2A21) on purpose. Reusing `ink` as a fill would put
   * the section's own default text colour at 1.00:1 against its ground - the
   * one pairing guaranteed to be invisible - and a band that is merely
   * ink-coloured reads as a heavy paragraph rather than a change of surface.
   */
  surfaceContrast: '#2A1D16',
  // The canvas, unchanged: 13.72:1 on the band above.
  onSurfaceContrast: '#F6E9DF',
}

/**
 * Dark "Gallery Wall": terracotta on neutral charcoal (PRD 9.2, revised
 * 2026-09-10).
 *
 * The ground moved off warm brown to a true neutral. Cards lift by luminance
 * alone rather than by hue, which is what keeps product photography - the only
 * saturated thing on the page - reading as the subject.
 */
export const darkTheme: ThemeTokens = {
  canvas: '#121212',
  // Lifted, not tinted. #1C1C1C separates from the canvas on a calibrated
  // screen without introducing a colour cast that would fight the photography.
  card: '#1C1C1C',
  ink: '#EDEDED',
  // 6.66:1 on canvas, 6.06:1 on card.
  muted: '#9A9A9A',
  // Decorative dividers only, where no contrast floor applies.
  line: 'rgba(255, 255, 255, 0.10)',
  // Raised from .36 to .40. On the old warm charcoal .36 measured 3.33:1; on
  // this darker, neutral ground the same alpha still passes but with almost no
  // margin, so it steps up to .40 (3.83:1 canvas, 3.79:1 card).
  lineStrong: 'rgba(255, 255, 255, 0.40)',
  /*
   * The light theme's terracotta lifted for a dark ground. Dark keeps the same
   * hue family as light now rather than diverging to brass: the accent reads as
   * one brand colour across both themes, and at 7.11:1 on canvas it is the only
   * token that clears AA as text, a border and a focus ring at once.
   */
  accent: '#E08A5F',
  accentDeep: '#C86F45',
  /*
   * Brightened well past the light theme's madder, and pinned by two floors at
   * once rather than chosen.
   *
   * `secondary` is both a destructive button FILL (label `canvas`, floor 4.5)
   * and a border on canvas (floor 3). Because the label is near-black here,
   * both floors pull the same way - lighter - and madder itself fails both
   * (2.93 border). This is the first step light enough to clear the label
   * floor: 4.59 for the label, 4.59 as a border on canvas, 4.17 on card.
   */
  secondary: '#C85C5C',
  /*
   * LIGHTER than the canvas, which is the whole asymmetry: this theme's ground
   * is already #121212, so a "dark strip" would be a band nobody can see.
   *
   * Lifted a step past `card` (#1C1C1C) so the band still reads as a distinct
   * surface where it meets a card, without becoming a second card itself:
   * 1.207:1 against canvas, 1.098:1 against card. Luminance only, no hue,
   * matching the reasoning that keeps this theme's cards neutral.
   */
  surfaceContrast: '#242424',
  /*
   * `ink`, unchanged - and the reason this is a token pair rather than one
   * colour. Dark needs NO inversion: its ordinary text already sits happily on
   * the band (13.26:1 here, and `muted` at 5.52:1), so only light flips.
   */
  onSurfaceContrast: '#EDEDED',
}

export const themes: Record<ThemeName, ThemeTokens> = {
  light: lightTheme,
  dark: darkTheme,
}

/**
 * Category colour-coding (PRD 9.3). Theme-independent: these are the one place
 * a multi-colour palette appears.
 *
 * This is a SUPERSET of the `Category.dye` union in the data seam, not a match.
 * The first four are the category tones and correspond 1:1 to `Dye` in
 * `src/lib/data/types.ts`; `sage` is a palette colour parked here (see below)
 * and is deliberately NOT assignable to a category.
 *
 * The asymmetry is load-bearing, so keep the two derivations straight:
 * `DyeName` (derived from this object, 5 tones) is the RENDERING palette, while
 * `Category['dye']` (4 tones) is the DATA CONTRACT with the teammate's Supabase
 * schema. A component keying off `DyeName` owes a `sage` entry; one keying off
 * `Category['dye']` must not have one. Widening `Dye` to include `sage` would
 * let the provider admit a category tone that no category has.
 */
export const dyes = {
  indigo: '#2E4374',
  madder: '#A63A3A',
  marigold: '#C9922B',
  brass: '#B8862F',
  /*
   * NOT A CATEGORY TONE. Currently unused: nothing renders sage today.
   *
   * Added 2026-09-10 with the palette revision. The reference palette's sage
   * could not take the `secondary` token - that slot means "something is
   * wrong" (invalid fields, error toasts, reject buttons) and a calm green
   * cannot say that - but it is a real part of the palette, so it lands here,
   * where the dyes are decorative category tones with no contrast floor.
   *
   * That is placement by elimination, not by intent: it is parked in the one
   * block with no contrast floor, which is why it is absent from `Dye` in the
   * data seam and from every `Record<Category['dye'], …>` map. Only `Chip`
   * names it, because `Chip` keys off `DyeName` and an exhaustive record will
   * not compile without it - that entry satisfies the compiler and styles no
   * craft.
   *
   * Before using it for anything, note the constraint that put it here: at
   * 2.28:1 on canvas it is below the 3:1 boundary floor, so it cannot carry a
   * border, an icon or any other load-bearing mark - decorative fills only.
   * A status badge is exactly the use it is unfit for. Giving it a real job
   * needs a §D decision (CLAUDE.md G, theme seam); making it a 7th category
   * tone additionally means adding it to `Dye` and to all 12
   * `Record<Category['dye'], …>` maps across 7 files.
   *
   * Slightly deepened from the reference #8DA38A so it reads as a dye rather
   * than a pastel against the parchment canvas.
   */
  sage: '#7E9679',
} as const

export type DyeName = keyof typeof dyes

export const DEFAULT_THEME: ThemeName = 'light'

/** Shared with the pre-paint script in index.html; keep the two in step. */
export const THEME_STORAGE_KEY = 'kalacart-theme'
