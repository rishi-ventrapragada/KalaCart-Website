import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
}

/** Shared max-width and horizontal padding (PRD 11.0). */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>
}
