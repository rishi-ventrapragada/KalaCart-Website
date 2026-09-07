/**
 * Shared button appearance, split from Button.tsx so a react-router <Link> can
 * wear the same look without the component prop-drilling an `as` escape hatch.
 *
 * Capsules per the PRD 9.5 shape binary. Styling here is deliberately plain:
 * this is pre-design-pass, and Increment 5 owns the visual language.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium ' +
  'transition-colors duration-200 ease-site ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

export const buttonVariants: Record<ButtonVariant, string> = {
  // NOTE: a solid accent fill brushes against the PRD 9.6 accent rule, which
  // reserves the accent for glows and highlights. A button is not a large
  // surface and a primary action needs to read as primary, but Increment 5 may
  // well overrule this.
  primary: 'bg-accent text-canvas hover:bg-accent-deep',
  secondary: 'border border-line-strong bg-card text-ink hover:border-accent',
  ghost: 'text-muted hover:bg-card hover:text-ink',
  destructive: 'bg-secondary text-canvas hover:opacity-90',
}

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}
