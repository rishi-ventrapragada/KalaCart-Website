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

/** Light "Raw Cotton": cool brand on warm neutral (PRD 9.1). */
export const lightTheme: ThemeTokens = {
  canvas: '#F5F0E6',
  card: '#FFFFFF',
  ink: '#241E1A',
  muted: '#6F6559',
  line: '#E3D9C6',
  // Resolved in Increment 5. The original derived #D6C9B0 measured 1.44:1 on
  // canvas, well under the 3:1 that WCAG AA requires of a UI boundary. This
  // value is the first step down the same hue that clears it on both surfaces:
  // 3.13:1 on canvas, 3.56:1 on card.
  lineStrong: '#9C8555',
  accent: '#2E4374',
  accentDeep: '#1B2A4A',
  secondary: '#B8862F',
}

/** Dark "Gallery Wall": warm metallic on warm charcoal (PRD 9.2). */
export const darkTheme: ThemeTokens = {
  canvas: '#17130F',
  card: '#201A15',
  ink: '#F3ECE0',
  muted: '#A79A88',
  // PRD 9.2's soft edge, kept for decorative dividers where no contrast floor
  // applies. Measures 1.31:1, which is fine for a rule and not for a control.
  line: 'rgba(255, 255, 255, 0.10)',
  // Resolved in Increment 5. PRD 9.2's stronger edge was .14 (1.50:1); .36 is
  // the first step clearing 3:1 against both canvas (3.33:1) and card (3.33:1).
  lineStrong: 'rgba(255, 255, 255, 0.36)',
  accent: '#C9922B',
  // Not in PRD 9.2, which gives one accent. Light has brand-deep for hover, so
  // dark gets a matching darker brass.
  accentDeep: '#A8761F',
  secondary: '#A63A3A',
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
} as const

export type DyeName = keyof typeof dyes

export const DEFAULT_THEME: ThemeName = 'light'

/** Shared with the pre-paint script in index.html; keep the two in step. */
export const THEME_STORAGE_KEY = 'kalacart-theme'
