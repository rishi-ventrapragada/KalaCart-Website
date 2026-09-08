import { Link } from 'react-router-dom'

import { Reveal } from '@/components/motion/Reveal'

interface SectionHeaderProps {
  heading: string
  body?: string | undefined
  linkTo?: string | undefined
  linkLabel?: string | undefined
}

/**
 * The shared heading block for Home's sections.
 *
 * Extracted so every section's heading sits at the same size, the same weight
 * and the same distance from its content. Three sections each styling their own
 * h2 is how a page drifts out of rhythm.
 *
 * The "see all" link is a quiet text link, not a button: PRD 9.6 keeps the
 * accent for glows and highlights, and a page with three competing capsule
 * buttons above the fold has no primary action left.
 */
export function SectionHeader({ heading, body, linkTo, linkLabel }: SectionHeaderProps) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl sm:text-3xl">{heading}</h2>
          {body && <p className="max-w-md text-sm text-muted sm:text-base">{body}</p>}
        </div>

        {linkTo && linkLabel && (
          <Link
            to={linkTo}
            className="text-sm text-accent underline-offset-4 transition-colors duration-200 ease-site hover:underline"
          >
            {linkLabel}
          </Link>
        )}
      </div>
    </Reveal>
  )
}
