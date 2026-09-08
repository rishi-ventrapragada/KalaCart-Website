import { useState } from 'react'

import { cn } from '@/lib/utils/cn'

interface RemoteImageProps {
  src: string
  /** Empty string for decorative imagery beside a visible label. */
  alt: string
  className?: string
  /** Applied to the wrapper, which owns the aspect ratio and the fallback. */
  wrapperClassName?: string
}

/**
 * An image that cannot break its card.
 *
 * Product and artisan imagery is served from a remote host (picsum today,
 * Supabase Storage later), so a single 404 or a blocked request is a normal
 * occurrence rather than an edge case. Left alone, a broken <img> collapses to
 * its alt text and drags the whole card's layout with it.
 *
 * So the wrapper owns the geometry and paints a tonal placeholder, and the
 * image sits on top of it. If the image fails it is simply removed and the
 * placeholder stands: the card keeps its shape and the row stays aligned.
 *
 * The placeholder is also what shows while the image is in flight, which means
 * no layout shift when it arrives.
 */
export function RemoteImage({ src, alt, className, wrapperClassName }: RemoteImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-canvas', wrapperClassName)}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => {
            setFailed(true)
          }}
          className={cn('absolute inset-0 size-full object-cover', className)}
        />
      )}
    </div>
  )
}
