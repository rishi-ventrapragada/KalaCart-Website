/**
 * Shared button appearance, split from Button.tsx so a react-router <Link> can
 * wear the same look without the component prop-drilling an `as` escape hatch.
 *
 * Capsules per the PRD 9.5 shape binary.
 *
 * Hover moves colour only, never geometry: no lift, no shadow growth. Lifting
 * cards on hover is one of the generic-craft-page tells CLAUDE.md names, and a
 * capsule that grows a shadow reads as a template.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium ' +
  'tracking-[-0.01em] whitespace-nowrap ' +
  // Colour-only transition on the one easing curve (PRD 9.7). Never
  // `transition: all`, and never animating geometry.
  'transition-[background-color,border-color,color] duration-200 ease-site ' +
  // Disabled drops the fill rather than dimming it. Dimming a filled capsule
  // leaves a muddy mid-tone with a low-contrast label on it; a flat outline
  // reads as unavailable and keeps the word legible.
  'disabled:cursor-not-allowed disabled:border disabled:border-line ' +
  'disabled:bg-transparent disabled:text-muted disabled:shadow-none'

export const buttonVariants: Record<ButtonVariant, string> = {
  // NOTE: a solid accent fill brushes against the PRD 9.6 accent rule, which
  // reserves the accent for glows and highlights. A button is not a large
  // surface and a primary action needs to read as primary, but Increment 5 may
  // well overrule this.
  primary: 'bg-accent text-canvas hover:bg-accent-deep',
  secondary: 'border border-line-strong bg-card text-ink hover:border-accent',
  ghost: 'text-muted hover:bg-card hover:text-ink',
  /*
   * `canvas`, not `ink` - inverted by the 2026-09-10 palette revision.
   *
   * This used to be `text-ink`, and that was correct while `secondary` was a
   * mid-tone amber and `ink` a dark brown: the dark label measured 5.09:1 on
   * it. Both ends moved. `secondary` is now madder (a dark red) and `ink` is a
   * dark espresso, which puts a dark label on a dark fill at 2.13:1 - badly
   * under AA and the worst pairing on the site.
   *
   * The fill is dark in both themes now, so the label follows `primary` and
   * goes light: 5.99:1 in light, 4.88:1 in dark.
   */
  destructive: 'bg-secondary text-canvas hover:bg-secondary/85',
}

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}
