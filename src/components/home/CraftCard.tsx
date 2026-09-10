import { Link } from 'react-router-dom'

import type { Category } from '@/lib/data'
import { cn } from '@/lib/utils/cn'

/**
 * Tailwind cannot see a class built at runtime, so every dye map is explicit.
 *
 * The dye now reaches the card's SURFACE, not just its border and dot. It is
 * carried as a low-alpha wash mixed into `card` rather than the saturated tone
 * itself: the dyes are theme-independent mid-tones (PRD 9.3), and filling a card
 * with one would put `ink` on a mid-tone ground and lose AA in at least one
 * theme. Mixed at this weight the craft is legible as colour while the label
 * keeps card-level contrast in both themes. See CLAUDE.md D, 2026-09-11.
 */
const DYE_SURFACE: Record<Category['dye'], string> = {
  indigo: 'bg-[color-mix(in_srgb,var(--color-indigo)_9%,var(--card))]',
  madder: 'bg-[color-mix(in_srgb,var(--color-madder)_9%,var(--card))]',
  marigold: 'bg-[color-mix(in_srgb,var(--color-marigold)_11%,var(--card))]',
  brass: 'bg-[color-mix(in_srgb,var(--color-brass)_11%,var(--card))]',
}

/** The hover state deepens the same wash rather than introducing a new hue. */
const DYE_SURFACE_HOVER: Record<Category['dye'], string> = {
  indigo: 'group-hover:bg-[color-mix(in_srgb,var(--color-indigo)_16%,var(--card))]',
  madder: 'group-hover:bg-[color-mix(in_srgb,var(--color-madder)_16%,var(--card))]',
  marigold: 'group-hover:bg-[color-mix(in_srgb,var(--color-marigold)_19%,var(--card))]',
  brass: 'group-hover:bg-[color-mix(in_srgb,var(--color-brass)_19%,var(--card))]',
}

const DYE_BORDER: Record<Category['dye'], string> = {
  indigo: 'border-indigo/45',
  madder: 'border-madder/45',
  marigold: 'border-marigold/45',
  brass: 'border-brass/45',
}

const DYE_DOT: Record<Category['dye'], string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
}

/** A rule of the craft's own dye, under the label. Reads as a bolt edge. */
const DYE_RULE: Record<Category['dye'], string> = {
  indigo: 'bg-indigo/70',
  madder: 'bg-madder/70',
  marigold: 'bg-marigold/70',
  brass: 'bg-brass/70',
}

interface CraftCardProps {
  category: Category
  /**
   * Duplicate copies exist only to make the loop seamless, so they are hidden
   * from assistive technology and taken out of the tab order: a screen reader
   * should hear six crafts, not twelve.
   */
  decorative?: boolean
}

export function CraftCard({ category, decorative = false }: CraftCardProps) {
  return (
    <Link
      to={`/browse?category=${category.slug}`}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className={cn(
        'group relative flex h-[8.5rem] w-[15rem] shrink-0 flex-col justify-between overflow-hidden',
        'rounded-card border p-5',
        // Only colour, shadow and transform transition, and all three share the
        // one easing curve (CLAUDE.md motion discipline). The marquee's own
        // travel is an animation on an ancestor, so it is untouched by this.
        'transition-[background-color,border-color,box-shadow,transform] duration-300 ease-site',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]',
        'motion-safe:hover:-translate-y-1 hover:border-accent',
        DYE_SURFACE[category.dye],
        DYE_SURFACE_HOVER[category.dye],
        DYE_BORDER[category.dye],
      )}
    >
      <span className={cn('size-2.5 rounded-full', DYE_DOT[category.dye])} />

      <span className="flex flex-col gap-2">
        <span
          className={cn(
            'h-px w-8 origin-left transition-transform duration-300 ease-site',
            'motion-safe:group-hover:scale-x-[2.5]',
            DYE_RULE[category.dye],
          )}
        />
        <span className="font-display text-xl leading-tight text-ink">{category.name}</span>
      </span>
    </Link>
  )
}
