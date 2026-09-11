import { useState } from 'react'

import { cn } from '@/lib/utils/cn'

interface RemoteImageProps {
  src: string
  /** Empty string for decorative imagery beside a visible label. */
  alt: string
  className?: string
  /** Applied to the wrapper, which owns the aspect ratio and the fallback. */
  wrapperClassName?: string
  /**
   * Load this image immediately rather than when it scrolls into view.
   *
   * Set it ONLY for imagery that is above the fold on first paint. Lazy loading
   * is the right default for a catalogue - most of Browse's 26 cards are far
   * below the viewport - but applying it to what is already on screen is a
   * measured cost, not a saving: the browser must lay the page out before it
   * can tell a lazy image is visible, so the request starts late and the
   * largest element on the page paints later than it needs to.
   *
   * `fetchPriority="high"` rides along with it, which is the half that actually
   * reorders the request against the stylesheet and font loads ahead of it.
   */
  priority?: boolean
}

/**
 * An image that cannot break its card.
 *
 * Product and artisan imagery is served from a remote host (Pexels today,
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
export function RemoteImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
}: RemoteImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-canvas', wrapperClassName)}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          // `async` even when priority: this decodes off the main thread either
          // way, and `sync` would block paint on a large hero frame.
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
