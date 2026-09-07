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
  /** Hairlines and dividers. */
  line: string
  /** Stronger edges: input borders, active outlines. */
  lineStrong: string
  /** The single accent per theme. Glows and highlights only (PRD 9.6). */
  accent: string
  /** Accent at rest under hover or pressed states. */
  accentDeep: string
  /** Sparingly, for a second signal. Never chrome. */
  secondary: string
}

/** Light "Raw Cotton": cool brand on warm neutral (PRD 9.1). */
export const lightTheme: ThemeTokens = {
  canvas: '#F5F0E6',
  card: '#FFFFFF',
  ink: '#241E1A',
  muted: '#6F6559',
  line: '#E3D9C6',
  // Not in PRD 9.1, which gives one line value. Dark specifies a stronger edge,
  // so light gets a matching one, derived a step darker than `line`.
  lineStrong: '#D6C9B0',
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
  line: 'rgba(255, 255, 255, 0.10)',
  lineStrong: 'rgba(255, 255, 255, 0.14)',
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
