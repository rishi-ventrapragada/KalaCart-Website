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
}

export const themes: Record<ThemeName, ThemeTokens> = {
  light: lightTheme,
  dark: darkTheme,
}

/**
 * Category colour-coding (PRD 9.3). Theme-independent: these are the one place
 * a multi-colour palette appears, and they match the `Category.dye` union in
 * the data seam.
 */
export const dyes = {
  indigo: '#2E4374',
  madder: '#A63A3A',
  marigold: '#C9922B',
  brass: '#B8862F',
  /*
   * Added 2026-09-10 with the palette revision. The reference palette's sage
   * could not take the `secondary` token - that slot means "something is
   * wrong" (invalid fields, error toasts, reject buttons) and a calm green
   * cannot say that - but it is a real part of the palette, so it lands here,
   * where the dyes are decorative category tones with no contrast floor.
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
