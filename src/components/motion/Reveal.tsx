import type { ElementType, ReactNode } from 'react'

import { useReveal } from '@/components/motion/useReveal'
import { cn } from '@/lib/utils/cn'

interface RevealProps {
  children: ReactNode
  /** Milliseconds behind its siblings, for the PRD 10.3 cascade. */
  delay?: number
  /** Render as something other than a div, to avoid a wrapper element. */
  as?: ElementType
  className?: string
}

/**
 * Declarative reveal-on-scroll. The transition itself lives in index.css, keyed
 * off `data-reveal` and `data-revealed`, so the styling stays in one place and
 * the transition can be scoped to opacity only (PRD 10.2).
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className }: RevealProps) {
  const ref = useReveal<HTMLElement>({ delay })

  return (
    <Tag ref={ref} data-reveal className={cn(className)}>
      {children}
    </Tag>
  )
}
